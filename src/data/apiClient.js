// apiClient.js
// All data fetching. Components never fetch directly — use useBibleData.js hooks.
//
// DATA_SOURCE:
//   'api'  — REST API (default)
//   'json' — local JSON files in public/data/ (fallback / offline)

import { parseSearch, normalizeBookName } from './searchParser.js'
import { getAppData, getBooks, getVersions, resolveBookId } from './appStore.js'

const DATA_SOURCE = 'api'
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://bible-explorer-api.gianksp.workers.dev' //'http://localhost:8787'

// ── JSON cache (json mode only) ───────────────────────────────────────────────

const jsonCache = {}

async function loadJSON(filename) {
    if (jsonCache[filename]) return jsonCache[filename]
    const res = await fetch(`/data/${filename}`)
    if (!res.ok) throw new Error(`Failed to load /data/${filename}: ${res.status}`)
    const data = await res.json()
    jsonCache[filename] = data
    return data
}

// ── REST fetch ────────────────────────────────────────────────────────────────

async function apiFetch(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([k, v]) => {
        if (v != null) url.searchParams.set(k, String(v))
    })
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`API ${res.status} on ${endpoint}`)
    return res.json()
}

// ── Map API passage response → app shape ──────────────────────────────────────

async function mapApiPassage(data, bookName) {
    const { idToName, otBookIds } = await getBooks()
    const { englishVersions, originalVersions } = await getVersions()

    return data.verses.map(v => {
        const isOT = otBookIds.has(v.book_id)
        const originalVersion = originalVersions.find(o =>
            o.testament === (isOT ? 'OT' : 'NT')
        )
        const versions = {}

        // English translations
        englishVersions.forEach(ev => {
            const text = v[ev.versionId.toLowerCase()]
            if (text) versions[ev.versionId] = { text }
        })

        // Original language words
        const verseWords = data.words?.[v.verse_id]
        if (verseWords?.length && originalVersion) {
            const mappedWords = verseWords.map(w => ({
                wordId: w.word_id,
                surface: w.surface,
                transliteration: w.transliteration,
                strongsNumber: w.strongs,
                morphology: w.morphology,
                englishGloss: w.gloss,
                definition: w.definition,
            }))
            versions[originalVersion.versionId] = {
                text: mappedWords.map(w => w.surface).join(' '),
                words: mappedWords,
            }
        }

        return {
            verseId: v.verse_id,
            book: idToName[v.book_id] ?? bookName,
            chapter: v.chapter,
            verse: v.verse,
            versions,
        }
    })
}

// ── Versions ──────────────────────────────────────────────────────────────────

export async function fetchVersions() {
    const { versions } = await getVersions()
    return versions
}

// ── Passage ───────────────────────────────────────────────────────────────────

export async function fetchPassage({ book, chapter, verseStart = null, verseEnd = null, activeVersionIds = [] }) {
    if (DATA_SOURCE === 'json') return fetchPassageJSON({ book, chapter, verseStart, verseEnd })

    const { originalVersions } = await getVersions()
    const originalIds = new Set(originalVersions.map(v => v.versionId))

    const versions = activeVersionIds
        .filter(id => !originalIds.has(id))
        .map(id => id.toLowerCase())
        .join(',') || 'kjv'

    const bookId = await resolveBookId(book)
    if (!bookId) throw new Error(`Unknown book: ${book}`)

    const data = await apiFetch('/passage', { book: bookId, chapter, verseStart, verseEnd, versions })
    return mapApiPassage(data, book)
}

async function fetchPassageJSON({ book, chapter, verseStart, verseEnd }) {
    const { nameToId, otBookIds } = await getBooks()
    const { englishVersions, originalVersions } = await getVersions()

    const canonicalBook = normalizeBookName(book)
    const bookId = nameToId[canonicalBook]
    if (!bookId) throw new Error(`Unknown book: ${book}`)

    const isOT = otBookIds.has(bookId)
    const chapterId = `${bookId}.${chapter}`
    const originalVersion = originalVersions.find(o => o.testament === (isOT ? 'OT' : 'NT'))

    const [chapterIndex, ...versionData] = await Promise.all([
        loadJSON('chapter-index.json'),
        ...englishVersions.map(v => loadJSON(v.dataFile).catch(() => ({}))),
        originalVersion ? loadJSON(originalVersion.dataFile).catch(() => ({})) : Promise.resolve({}),
    ])

    const englishData = versionData.slice(0, englishVersions.length)
    const originalWords = versionData[englishVersions.length] ?? {}

    const verseIds = (chapterIndex[chapterId] ?? []).filter(id => {
        const n = parseInt(id.split('.')[2])
        if (verseStart !== null && verseEnd !== null) return n >= verseStart && n <= verseEnd
        if (verseStart !== null) return n === verseStart
        return true
    })

    return verseIds.map(id => {
        const verseNum = parseInt(id.split('.')[2])
        const versions = {}
        englishVersions.forEach((v, i) => {
            const text = englishData[i][id]
            if (text) versions[v.versionId] = { text }
        })
        const words = originalWords[id]
        if (words?.length && originalVersion) {
            versions[originalVersion.versionId] = {
                text: words.map(w => w.surface).join(' '),
                words,
            }
        }
        return { verseId: id, book: canonicalBook, chapter, verse: verseNum, versions }
    })
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fetchSearch({ rawQuery, activeVersionIds = [] }) {
    const parsed = parseSearch(rawQuery)
    if (!parsed) return []

    if (DATA_SOURCE === 'json') return jsonSearch(parsed)

    if (parsed.type === 'keyword' || parsed.type === 'strongs') {
        const versions = activeVersionIds.map(id => id.toLowerCase()).join(',') || 'kjv'
        const q = parsed.type === 'strongs'
            ? `${parsed.language === 'greek' ? 'G' : 'H'}${parsed.number}`
            : rawQuery
        const data = await apiFetch('/search', { q, type: parsed.type, versions })
        return data.results ?? []
    }

    if (parsed.type === 'passage') {
        const verses = await fetchPassage({
            book: parsed.book, chapter: parsed.chapter,
            verseStart: parsed.verseStart, verseEnd: parsed.verseEnd, activeVersionIds,
        })
        return versesToResults(verses)
    }

    if (parsed.type === 'multi-passage') {
        const all = await Promise.all(
            parsed.passages.map(p =>
                fetchPassage({
                    book: p.book, chapter: p.chapter,
                    verseStart: p.verseStart, verseEnd: p.verseEnd, activeVersionIds
                }).catch(() => [])
            )
        )
        return versesToResults(all.flat())
    }

    return []
}

async function jsonSearch(parsed) {
    const { idToName } = await getBooks()
    const { defaultVersion, englishVersions, originalVersions } = await getVersions()

    if (parsed.type === 'passage') {
        return versesToResults(await fetchPassageJSON({
            book: parsed.book, chapter: parsed.chapter,
            verseStart: parsed.verseStart, verseEnd: parsed.verseEnd,
        }))
    }

    if (parsed.type === 'multi-passage') {
        const all = await Promise.all(
            parsed.passages.map(p =>
                fetchPassageJSON({
                    book: p.book, chapter: p.chapter,
                    verseStart: p.verseStart, verseEnd: p.verseEnd
                }).catch(() => [])
            )
        )
        return versesToResults(all.flat())
    }

    if (parsed.type === 'strongs') {
        const isGreek = parsed.language === 'greek'
        const sn = `${isGreek ? 'G' : 'H'}${parsed.number}`
        const origFile = isGreek ? 'gnt-words.json' : 'ot-words.json'
        const [words, primaryVerses] = await Promise.all([
            loadJSON(origFile).catch(() => ({})),
            loadJSON(defaultVersion.dataFile),
        ])
        return Object.entries(words)
            .filter(([, ws]) => ws.some(w => w.strongsNumber === sn))
            .slice(0, 200)
            .map(([id]) => verseIdToResult(id, primaryVerses[id] ?? '', [sn], idToName, defaultVersion))
    }

    if (parsed.type === 'keyword') {
        const primaryVerses = await loadJSON(defaultVersion.dataFile)
        const { terms, excludeTerms, operator } = parsed
        return Object.entries(primaryVerses)
            .filter(([, text]) => {
                const lower = text.toLowerCase()
                if (excludeTerms.some(t => lower.includes(t))) return false
                return operator === 'OR'
                    ? terms.some(t => lower.includes(t))
                    : terms.every(t => lower.includes(t))
            })
            .slice(0, 100)
            .map(([id, text]) => verseIdToResult(id, text, parsed.terms, idToName, defaultVersion))
    }

    return []
}

// ── Strong's ──────────────────────────────────────────────────────────────────

export async function fetchStrongs(strongsNumber) {
    if (!strongsNumber) return null
    if (DATA_SOURCE === 'json') {
        const isGreek = strongsNumber.startsWith('G')
        const dict = await loadJSON(isGreek ? 'strongs-greek.json' : 'strongs-hebrew.json').catch(() => ({}))
        return dict[strongsNumber] ?? null
    }
    const data = await apiFetch(`/strongs/${strongsNumber}`)
    return {
        strongsNumber: data.number,
        language: data.language,
        transliteration: data.transliteration,
        definition: data.definition,
        shortDef: data.short_def,
    }
}

export async function fetchStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    if (!strongsNumber) return []
    if (DATA_SOURCE === 'json') {
        const { idToName } = await getBooks()
        const { defaultVersion } = await getVersions()
        const isGreek = strongsNumber.startsWith('G')
        const [words, primaryVerses] = await Promise.all([
            loadJSON(isGreek ? 'gnt-words.json' : 'ot-words.json').catch(() => ({})),
            loadJSON(defaultVersion.dataFile),
        ])
        return Object.entries(words)
            .filter(([, ws]) => ws.some(w => w.strongsNumber === strongsNumber))
            .slice(0, 200)
            .map(([id]) => verseIdToResult(id, primaryVerses[id] ?? '', [strongsNumber], idToName, defaultVersion))
    }
    const data = await apiFetch(`/strongs/${strongsNumber}/occurrences`)
    return data.results ?? []
}

// ── Daily Readings ────────────────────────────────────────────────────────────

function readingToQuery(ref) {
    return ref.replace(/([0-9])[a-z](\s|$)/gi, '$1$2').trim()
}

export async function fetchDailyReadings() {
    const url = DATA_SOURCE === 'api'
        ? `${API_BASE_URL}/daily`
        : (() => {
            const today = new Date()
            const month = String(today.getMonth() + 1).padStart(2, '0')
            const day = String(today.getDate()).padStart(2, '0')
            return `https://cpbjr.github.io/catholic-readings-api/readings/${today.getFullYear()}/${month}-${day}.json`
        })()

    const res = await fetch(url)
    if (!res.ok) throw new Error('Daily readings not available')
    const data = await res.json()
    if (!data?.readings) throw new Error('No readings data')

    const { firstReading, psalm, secondReading, gospel } = data.readings
    const suggestions = []

    if (firstReading) suggestions.push({ label: `First Reading · ${firstReading}`, query: readingToQuery(firstReading), type: 'daily', group: "Today's Mass" })
    if (psalm) suggestions.push({ label: `Psalm · ${psalm.split(',')[0]}`, query: readingToQuery(psalm.split(',')[0]), type: 'daily', group: "Today's Mass" })
    if (secondReading) suggestions.push({ label: `Second Reading · ${secondReading}`, query: readingToQuery(secondReading), type: 'daily', group: "Today's Mass" })
    if (gospel) suggestions.push({ label: `Gospel · ${gospel}`, query: readingToQuery(gospel), type: 'daily', group: "Today's Mass" })

    return { season: data.season ?? '', celebration: data.celebration?.name ?? null, suggestions }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function versesToResults(verses) {
    const { defaultVersion } = await getVersions()
    return verses.map(v => ({
        verseId: v.verseId,
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        snippet: v.versions[defaultVersion.versionId]?.text ?? '',
        matchedTerms: [],
        versionId: defaultVersion.versionId,
    }))
}

function verseIdToResult(id, snippet, matchedTerms, idToName, defaultVersion) {
    const [bookId, chapter, verse] = id.split('.')
    return {
        verseId: id,
        book: idToName?.[bookId] ?? bookId,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        snippet,
        matchedTerms,
        versionId: defaultVersion.versionId,
    }
}