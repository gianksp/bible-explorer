// apiClient.js
// ─────────────────────────────────────────────────────────────────────────────
// All data fetching goes through here.
//
// DATA_SOURCE = 'json' → reads from public/data/*.json files
// DATA_SOURCE = 'api'  → hits REST API at API_BASE_URL
//
// To add a new Bible version: edit versions.js only.
// To switch to a real API: change DATA_SOURCE to 'api' and set API_BASE_URL.
// ─────────────────────────────────────────────────────────────────────────────

import { parseSearch, normalizeBookName } from './searchParser.js'
import {
    VERSIONS,
    ENGLISH_VERSIONS,
    DEFAULT_VERSION,
    getOriginalForTestament,
} from './versions.js'

const DATA_SOURCE = 'json'
const API_BASE_URL = 'https://your-api.com/v1'

// ── Book maps ─────────────────────────────────────────────────────────────────

const OT_BOOK_IDS = new Set([
    'Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth',
    '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh',
    'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Isa', 'Jer',
    'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jonah',
    'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
    '1Esd', '2Esd', 'Tob', 'Jdt', 'AddEst', 'Wis', 'Sir', 'Bar',
    'PrAzar', 'Sus', 'Bel', 'PrMan', '1Macc', '2Macc',
])

const BOOK_NAME_TO_ID = {
    'Genesis': 'Gen', 'Exodus': 'Ex', 'Leviticus': 'Lev', 'Numbers': 'Num',
    'Deuteronomy': 'Deut', 'Joshua': 'Josh', 'Judges': 'Judg', 'Ruth': 'Ruth',
    '1 Samuel': '1Sam', '2 Samuel': '2Sam', '1 Kings': '1Kgs', '2 Kings': '2Kgs',
    '1 Chronicles': '1Chr', '2 Chronicles': '2Chr', 'Ezra': 'Ezra', 'Nehemiah': 'Neh',
    'Esther': 'Esth', 'Job': 'Job', 'Psalms': 'Ps', 'Proverbs': 'Prov',
    'Ecclesiastes': 'Eccl', 'Song of Solomon': 'Song', 'Isaiah': 'Isa',
    'Jeremiah': 'Jer', 'Lamentations': 'Lam', 'Ezekiel': 'Ezek', 'Daniel': 'Dan',
    'Hosea': 'Hos', 'Joel': 'Joel', 'Amos': 'Amos', 'Obadiah': 'Obad',
    'Jonah': 'Jonah', 'Micah': 'Mic', 'Nahum': 'Nah', 'Habakkuk': 'Hab',
    'Zephaniah': 'Zeph', 'Haggai': 'Hag', 'Zechariah': 'Zech', 'Malachi': 'Mal',
    '1 Esdras': '1Esd', '2 Esdras': '2Esd', 'Tobit': 'Tob', 'Judith': 'Jdt',
    'Additions to Esther': 'AddEst', 'Wisdom': 'Wis', 'Sirach': 'Sir', 'Baruch': 'Bar',
    'Prayer of Azariah': 'PrAzar', 'Susanna': 'Sus', 'Bel and the Dragon': 'Bel',
    'Prayer of Manasses': 'PrMan', '1 Maccabees': '1Macc', '2 Maccabees': '2Macc',
    'Matthew': 'Matt', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
    'Acts': 'Acts', 'Romans': 'Rom', '1 Corinthians': '1Cor', '2 Corinthians': '2Cor',
    'Galatians': 'Gal', 'Ephesians': 'Eph', 'Philippians': 'Phil', 'Colossians': 'Col',
    '1 Thessalonians': '1Th', '2 Thessalonians': '2Th', '1 Timothy': '1Tim',
    '2 Timothy': '2Tim', 'Titus': 'Titus', 'Philemon': 'Phlm', 'Hebrews': 'Heb',
    'James': 'Jas', '1 Peter': '1Pet', '2 Peter': '2Pet', '1 John': '1Jn',
    '2 John': '2Jn', '3 John': '3Jn', 'Jude': 'Jude', 'Revelation': 'Rev',
}

const ID_TO_BOOK_NAME = Object.fromEntries(
    Object.entries(BOOK_NAME_TO_ID).map(([name, id]) => [id, name])
)

// ── JSON cache ────────────────────────────────────────────────────────────────

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
    const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`API ${res.status} on ${endpoint}`)
    return res.json()
}

// ── Versions ──────────────────────────────────────────────────────────────────

export async function fetchVersions() {
    if (DATA_SOURCE === 'json') return VERSIONS
    return apiFetch('/versions')
}

// ── Passage ───────────────────────────────────────────────────────────────────
//
// Returns array of verse objects:
// {
//   verseId:  'John.1.1',
//   book:     'John',
//   chapter:  1,
//   verse:    1,
//   versions: {
//     KJV: { text: '...' },
//     DRC: { text: '...' },
//     GNT: { text: '...', words: [ wordObj, ... ] },
//   }
// }

export async function fetchPassage({ book, chapter, verseStart = null, verseEnd = null, activeVersionIds = [] }) {
    if (DATA_SOURCE === 'json') return fetchPassageJSON({ book, chapter, verseStart, verseEnd })
    return apiFetch('/passage', { book, chapter, verseStart, verseEnd, versions: activeVersionIds.join(',') })
}

async function fetchPassageJSON({ book, chapter, verseStart, verseEnd }) {
    const canonicalBook = normalizeBookName(book)
    const bookId = BOOK_NAME_TO_ID[canonicalBook]
    if (!bookId) throw new Error(`Unknown book: ${book}`)

    const isOT = OT_BOOK_IDS.has(bookId)
    const chapterId = `${bookId}.${chapter}`
    const originalVersion = getOriginalForTestament(isOT)

    // Load chapter index + all English versions + original language in parallel
    const [chapterIndex, ...versionData] = await Promise.all([
        loadJSON('chapter-index.json'),
        ...ENGLISH_VERSIONS.map(v => loadJSON(v.dataFile).catch(() => ({}))),
        originalVersion
            ? loadJSON(originalVersion.dataFile).catch(() => ({}))
            : Promise.resolve({}),
    ])

    const englishData = versionData.slice(0, ENGLISH_VERSIONS.length)
    const originalWords = versionData[ENGLISH_VERSIONS.length] ?? {}

    // Filter to requested verse range
    const verseIds = (chapterIndex[chapterId] ?? []).filter(id => {
        const n = parseInt(id.split('.')[2])
        if (verseStart !== null && verseEnd !== null) return n >= verseStart && n <= verseEnd
        if (verseStart !== null) return n === verseStart
        return true
    })

    return verseIds.map(id => {
        const verseNum = parseInt(id.split('.')[2])

        // Build versions object — include all English versions that have this verse
        const versions = {}
        ENGLISH_VERSIONS.forEach((v, i) => {
            const text = englishData[i][id]
            if (text) versions[v.versionId] = { text }
        })

        // Attach original language words if available
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
    return apiFetch('/search', { q: rawQuery, type: parsed.type, versions: activeVersionIds.join(',') })
}

async function jsonSearch(parsed) {
    if (parsed.type === 'passage') {
        return versesToResults(await fetchPassageJSON({
            book: parsed.book, chapter: parsed.chapter,
            verseStart: parsed.verseStart, verseEnd: parsed.verseEnd,
        }))
    }

    if (parsed.type === 'multi-passage') {
        const all = await Promise.all(
            parsed.passages.map(p =>
                fetchPassageJSON({ book: p.book, chapter: p.chapter, verseStart: p.verseStart, verseEnd: p.verseEnd })
                    .catch(() => [])
            )
        )
        return versesToResults(all.flat())
    }

    if (parsed.type === 'strongs') {
        const isGreek = parsed.language === 'greek'
        const sn = `${isGreek ? 'G' : 'H'}${parsed.number}`
        const [words, primaryVerses] = await Promise.all([
            loadJSON(isGreek ? 'gnt-words.json' : 'ot-words.json').catch(() => ({})),
            loadJSON(DEFAULT_VERSION.dataFile),
        ])
        return Object.entries(words)
            .filter(([, ws]) => ws.some(w => w.strongsNumber === sn))
            .slice(0, 200)
            .map(([id]) => verseIdToResult(id, primaryVerses[id] ?? '', [sn]))
    }

    if (parsed.type === 'keyword') {
        const primaryVerses = await loadJSON(DEFAULT_VERSION.dataFile)
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
            .map(([id, text]) => verseIdToResult(id, text, parsed.terms))
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
    return apiFetch(`/strongs/${strongsNumber}`)
}

export async function fetchStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    if (!strongsNumber) return []
    if (DATA_SOURCE === 'json') {
        const isGreek = strongsNumber.startsWith('G')
        const [words, primaryVerses] = await Promise.all([
            loadJSON(isGreek ? 'gnt-words.json' : 'ot-words.json').catch(() => ({})),
            loadJSON(DEFAULT_VERSION.dataFile),
        ])
        return Object.entries(words)
            .filter(([, ws]) => ws.some(w => w.strongsNumber === strongsNumber))
            .slice(0, 200)
            .map(([id]) => verseIdToResult(id, primaryVerses[id] ?? '', [strongsNumber]))
    }
    return apiFetch(`/strongs/${strongsNumber}/occurrences`, { versions: activeVersionIds.join(',') })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function versesToResults(verses) {
    return verses.map(v => ({
        verseId: v.verseId,
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        snippet: v.versions[DEFAULT_VERSION.versionId]?.text ?? '',
        matchedTerms: [],
        versionId: DEFAULT_VERSION.versionId,
    }))
}

function verseIdToResult(id, snippet, matchedTerms) {
    const [bookId, chapter, verse] = id.split('.')
    return {
        verseId: id,
        book: ID_TO_BOOK_NAME[bookId] ?? bookId,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        snippet,
        matchedTerms,
        versionId: DEFAULT_VERSION.versionId,
    }
}
