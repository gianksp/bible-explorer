// apiClient.js
// Thin client — all query parsing is done by the API.
// Just pass raw queries through and map responses to app shapes.

import { bibleApi } from './bibleApi.js'
import { getVersions, getBooks } from './appStore.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function bookIdToName(bookId, idToName) {
    return idToName?.[bookId] ?? bookId
}

function mapPassageResults(results, idToName, originalVersion, wordsByVerse = {}) {
    const verseMap = {}

    for (const result of results) {
        Object.entries(result.bibles ?? {}).forEach(([bibleId, verses]) => {
            for (const v of verses) {
                const verseId = `${v.book_id}.${v.chapter}.${v.verse}`
                if (!verseMap[verseId]) {
                    verseMap[verseId] = {
                        verseId,
                        book: bookIdToName(v.book_id, idToName),
                        chapter: v.chapter,
                        verse: v.verse,
                        versions: {},
                    }
                }
                if (v.text) verseMap[verseId].versions[bibleId.toUpperCase()] = { text: v.text }
            }
        })
    }

    return Object.values(verseMap).map(v => {
        const verseWords = wordsByVerse[v.verseId] ?? []

        if (verseWords.length && originalVersion) {
            const mappedWords = verseWords.map(w => ({
                wordId: w.word_id,
                surface: w.surface,
                transliteration: w.transliteration,
                strongsNumber: w.strongs_number,
                morphology: w.morphology,
                englishGloss: w.english_gloss,
                definition: w.definition,
            }))
            v.versions[originalVersion.versionId] = {
                text: mappedWords.map(w => w.surface).join(' '),
                words: mappedWords,
            }
        }

        return { verseId: v.verseId, book: v.book, chapter: v.chapter, verse: v.verse, versions: v.versions }
    })
}

function groupWordsByVerse(interlinearResults) {
    const map = {}
    for (const result of interlinearResults ?? []) {
        for (const v of result.verses ?? []) {
            const verseId = `${v.book_id}.${v.chapter}.${v.verse ?? 1}`
            map[verseId] = v.words ?? []
        }
    }
    return map
}

function mapSearchResults(results, idToName, defaultVersionId, matchedTerms = []) {
    const verseMap = {}

    for (const result of results) {
        Object.entries(result.bibles ?? {}).forEach(([bibleId, verses]) => {
            for (const v of verses) {
                const verseId = `${v.book_id}.${v.chapter}.${v.verse}`
                if (!verseMap[verseId]) {
                    verseMap[verseId] = {
                        verseId,
                        book: bookIdToName(v.book_id, idToName),
                        chapter: v.chapter,
                        verse: v.verse,
                        snippet: v.text ?? '',
                        matchedTerms,
                        versionId: bibleId.toUpperCase(),
                        versions: {},
                    }
                }
                verseMap[verseId].versions[bibleId.toUpperCase()] = { text: v.text ?? '' }
                if (!verseMap[verseId].snippet) verseMap[verseId].snippet = v.text ?? ''
            }
        })
    }

    return Object.values(verseMap)
}

function getBibles(activeVersionIds, originalIds, defaultBibleId) {
    return activeVersionIds
        .filter(id => !originalIds.has(id))
        .map(id => id.toLowerCase())
        .join(',') || defaultBibleId
}

// ── Versions ──────────────────────────────────────────────────────────────────

export async function fetchVersions() {
    const { versions } = await getVersions()
    return versions
}

// ── Passage ───────────────────────────────────────────────────────────────────

export async function fetchPassage({
    rawQuery,
    book,
    chapter,
    verseStart = null,
    verseEnd = null,
    activeVersionIds = [],
    showInterlinear = false,
}) {
    const { idToName, otBookIds } = await getBooks()
    const { originalVersions, defaultVersion } = await getVersions()

    const originalIds = new Set(originalVersions.map(v => v.versionId))
    const shouldInterlinear = showInterlinear || activeVersionIds.some(id => originalIds.has(id))
    const bibles = getBibles(activeVersionIds, originalIds, defaultVersion.bibleId)

    // Use rawQuery if provided, otherwise build ref from parts
    let ref = rawQuery
    if (!ref && book && chapter) {
        ref = `${book} ${chapter}`
        if (verseStart && verseEnd) ref += `:${verseStart}-${verseEnd}`
        else if (verseStart) ref += `:${verseStart}`
    }

    if (!ref) return []

    const bookIdLower = (book ?? '').toLowerCase().replace(/\s+/g, '')
    const isOT = otBookIds.has(bookIdLower)
    const originalVersion = originalVersions.find(o => o.testament === (isOT ? 'OT' : 'NT'))

    const [passageData, interlinearData] = await Promise.all([
        bibleApi.getVerses(ref, bibles),
        shouldInterlinear
            ? bibleApi.getInterlinear(ref).catch(() => null)
            : Promise.resolve(null),
    ])

    const wordsByVerse = groupWordsByVerse(interlinearData?.results)

    return mapPassageResults(
        passageData?.results ?? [],
        idToName,
        shouldInterlinear ? originalVersion : null,
        wordsByVerse
    )
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fetchSearch({ rawQuery, activeVersionIds = [], showInterlinear = false }) {
    if (!rawQuery?.trim()) return []

    const { idToName } = await getBooks()
    const { defaultVersion, originalVersions } = await getVersions()

    const originalIds = new Set(originalVersions.map(v => v.versionId))
    const bibles = getBibles(activeVersionIds, originalIds, defaultVersion.bibleId)

    let data
    try {
        data = await bibleApi.getVerses(rawQuery, bibles)
        if (!data?.results?.length) {
            data = await bibleApi.searchVerses(rawQuery, bibles)
        }
    } catch {
        data = await bibleApi.searchVerses(rawQuery, bibles)
    }

    const terms = rawQuery
        .replace(/["]/g, '')
        .split(/\s+/)
        .filter(t => !['OR', 'AND'].includes(t) && !t.startsWith('-') && t.length > 0)
        .map(t => t.toLowerCase())

    const results = mapSearchResults(data?.results ?? [], idToName, defaultVersion.versionId, terms)

    // Fetch interlinear for all unique references when enabled
    if (showInterlinear && results.length) {
        try {
            const interlinearData = await bibleApi.getInterlinear(rawQuery).catch(() => null)
            if (interlinearData?.results) {
                const wordsByVerse = groupWordsByVerse(interlinearData.results)
                const { originalVersions: origVs } = await getVersions()
                results.forEach(r => {
                    const words = wordsByVerse[r.verseId]
                    if (!words?.length) return
                    // Determine OT/NT from book
                    const isOT = r.verseId.split('.')[0].match(/genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalms|proverbs|ecclesiastes|song|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi/i)
                    const origV = origVs.find(o => o.testament === (isOT ? 'OT' : 'NT'))
                    if (!origV) return
                    const mappedWords = words.map(w => ({
                        wordId: w.word_id,
                        surface: w.surface,
                        transliteration: w.transliteration,
                        strongsNumber: w.strongs_number,
                        morphology: w.morphology,
                        englishGloss: w.english_gloss,
                        definition: w.definition,
                    }))
                    if (!r.versions) r.versions = {}
                    r.versions[origV.versionId] = {
                        text: mappedWords.map(w => w.surface).join(' '),
                        words: mappedWords,
                    }
                })
            }
        } catch { }
    }

    return results
}

// ── Daily Readings ────────────────────────────────────────────────────────────

export async function fetchDailyReadings(activeVersionIds = []) {
    const { defaultVersion, originalVersions } = await getVersions()
    const { idToName } = await getBooks()

    const originalIds = new Set(originalVersions.map(v => v.versionId))
    const bibles = activeVersionIds
        .filter(id => !originalIds.has(id))
        .map(id => id.toLowerCase())
        .join(',') || defaultVersion.bibleId

    const data = await bibleApi.getDailyReadings(bibles)

    const suggestions = (data.readings ?? []).map(reading => {
        const verseMap = {}
        Object.entries(reading.bibles ?? {}).forEach(([bibleId, verses]) => {
            for (const v of verses) {
                const verseId = `${v.book_id}.${v.chapter}.${v.verse}`
                if (!verseMap[verseId]) {
                    verseMap[verseId] = {
                        verseId,
                        book: bookIdToName(v.book_id, idToName),
                        chapter: v.chapter,
                        verse: v.verse,
                        versions: {},
                    }
                }
                verseMap[verseId].versions[bibleId.toUpperCase()] = { text: v.text }
            }
        })

        return {
            label: `${reading.title} · ${reading.reference}`,
            query: reading.reference,
            type: 'daily',
            group: "Today's Mass",
            title: reading.title,
            reference: reading.reference,
            verses: Object.values(verseMap),
        }
    })

    return {
        season: data.season ?? '',
        celebration: data.celebration ?? null,
        suggestions,
    }
}

// ── Strong's ──────────────────────────────────────────────────────────────────

export async function fetchStrongs(strongsNumber) {
    if (!strongsNumber) return null
    return {
        strongsNumber,
        language: strongsNumber.startsWith('G') ? 'greek' : 'hebrew',
        definition: null,
        shortDef: null,
    }
}

export async function fetchStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    if (!strongsNumber) return []
    return fetchSearch({
        rawQuery: strongsNumber,
        activeVersionIds: activeVersionIds.length ? activeVersionIds : ['KJV'],
    })
}