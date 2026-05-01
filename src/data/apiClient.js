// apiClient.js
// Single swap point between data sources.
//
// DATA_SOURCE options:
//   'mock' — uses mockVerses.js (instant, no files needed)
//   'json' — reads from public/data/*.json (run process-bible-data.mjs first)
//   'api'  — hits a real REST API at API_BASE_URL

import { parseSearch, normalizeBookName } from './searchParser.js'

const DATA_SOURCE = 'json'
const API_BASE_URL = 'https://your-api.com/v1'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

const OT_BOOK_IDS = new Set([
    'Gen', 'Ex', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth',
    '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh',
    'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Isa', 'Jer',
    'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos', 'Obad', 'Jonah',
    'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
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

// ── JSON file cache ───────────────────────────────────────────────────────────

const jsonCache = {}

async function loadJSON(filename) {
    if (jsonCache[filename]) return jsonCache[filename]
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) throw new Error(`Failed to load /data/${filename}: ${response.status}`)
    const data = await response.json()
    jsonCache[filename] = data
    return data
}

// ── Mock imports ──────────────────────────────────────────────────────────────

let _mockData = null
async function getMockData() {
    if (_mockData) return _mockData
    const m = await import('./mockVerses.js')
    _mockData = m
    return m
}

// ── REST fetch ────────────────────────────────────────────────────────────────

async function apiFetch(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) url.searchParams.set(k, String(v))
    })
    const res = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`API error ${res.status} on ${endpoint}`)
    return res.json()
}

// ── Versions ──────────────────────────────────────────────────────────────────

const STATIC_VERSIONS = [
    { versionId: 'KJV', label: 'KJV', language: 'english', isOriginal: false },
    { versionId: 'GNT', label: 'GNT', language: 'greek', isOriginal: true },
    { versionId: 'WLC', label: 'WLC', language: 'hebrew', isOriginal: true },
]

export async function fetchVersions() {
    if (DATA_SOURCE === 'mock') {
        const { MOCK_VERSIONS } = await getMockData()
        return MOCK_VERSIONS
    }
    if (DATA_SOURCE === 'json') return STATIC_VERSIONS
    return apiFetch('/versions')
}

// ── Passage ───────────────────────────────────────────────────────────────────

export async function fetchPassage({
    book,
    chapter,
    verseStart = null,
    verseEnd = null,
    activeVersionIds = [],
}) {
    if (DATA_SOURCE === 'mock') return fetchPassageMock({ book, chapter, verseStart, verseEnd, activeVersionIds })
    if (DATA_SOURCE === 'json') return fetchPassageJSON({ book, chapter, verseStart, verseEnd })
    return apiFetch('/passage', { book, chapter, verseStart, verseEnd, versions: activeVersionIds.join(',') })
}

async function fetchPassageMock({ book, chapter, verseStart, verseEnd, activeVersionIds }) {
    const { MOCK_VERSES } = await getMockData()
    return MOCK_VERSES
        .filter(v => v.book === book && v.chapter === chapter)
        .filter(v => {
            if (verseStart === null && verseEnd === null) return true
            if (verseEnd === null) return v.verse === verseStart
            return v.verse >= verseStart && v.verse <= verseEnd
        })
        .map(verse => ({
            ...verse,
            versions: Object.fromEntries(
                Object.entries(verse.versions).filter(([id]) =>
                    activeVersionIds.includes(id) || ORIGINAL_VERSION_IDS.includes(id)
                )
            ),
        }))
}

async function fetchPassageJSON({ book, chapter, verseStart, verseEnd }) {
    // Normalize book name — handles 'psalm'→'Psalms', 'jn'→'John' etc
    const canonicalBook = normalizeBookName(book)
    const bookId = BOOK_NAME_TO_ID[canonicalBook]
    if (!bookId) throw new Error(`Unknown book: ${book}`)

    const chapterId = `${bookId}.${chapter}`
    const isOT = OT_BOOK_IDS.has(bookId)

    const [chapterIndex, kjvVerses, originalWords] = await Promise.all([
        loadJSON('chapter-index.json'),
        loadJSON('kjv.json'),
        loadJSON(isOT ? 'ot-words.json' : 'gnt-words.json').catch(() => ({})),
    ])

    const verseIds = (chapterIndex[chapterId] ?? []).filter(id => {
        const verseNum = parseInt(id.split('.')[2])
        if (verseStart !== null && verseNum < verseStart) return false
        if (verseEnd !== null && verseNum > verseEnd) return false
        return true
    })

    return verseIds.map(id => {
        const verseNum = parseInt(id.split('.')[2])
        const kjvText = kjvVerses[id] ?? ''
        const originalWords_ = originalWords[id]

        const versions = { KJV: { text: kjvText } }

        if (originalWords_?.length) {
            const versionKey = isOT ? 'WLC' : 'GNT'
            const text = originalWords_
                .map(w => w.surface
                    .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
                    .replace(/[/\\׃]/g, '')
                    .trim()
                )
                .join(' ')
            versions[versionKey] = { text, words: originalWords_ }
        }

        return {
            verseId: id,
            book: canonicalBook,
            chapter,
            verse: verseNum,
            versions,
        }
    })
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fetchSearch({ rawQuery, activeVersionIds = [] }) {
    const parsedQuery = parseSearch(rawQuery)
    if (!parsedQuery) return []

    if (DATA_SOURCE === 'mock') {
        const { MOCK_VERSES, MOCK_SEARCH_RESULTS } = await getMockData()
        return mockSearch(parsedQuery, activeVersionIds, MOCK_VERSES, MOCK_SEARCH_RESULTS)
    }

    if (DATA_SOURCE === 'json') return jsonSearch(parsedQuery)

    return apiFetch('/search', {
        q: rawQuery,
        type: parsedQuery.type,
        versions: activeVersionIds.join(','),
    })
}

async function jsonSearch(parsedQuery) {
    // Single passage
    if (parsedQuery.type === 'passage') {
        const verses = await fetchPassageJSON({
            book: parsedQuery.book,
            chapter: parsedQuery.chapter,
            verseStart: parsedQuery.verseStart,
            verseEnd: parsedQuery.verseEnd,
        })
        return verses.map(v => ({
            verseId: v.verseId,
            book: v.book,
            chapter: v.chapter,
            verse: v.verse,
            snippet: v.versions.KJV?.text ?? '',
            matchedTerms: [],
            versionId: 'KJV',
        }))
    }

    // Multiple passages — semicolons or commas
    if (parsedQuery.type === 'multi-passage') {
        const allVerses = await Promise.all(
            parsedQuery.passages.map(p =>
                fetchPassageJSON({
                    book: p.book,
                    chapter: p.chapter,
                    verseStart: p.verseStart,
                    verseEnd: p.verseEnd,
                }).catch(() => [])
            )
        )
        return allVerses.flat().map(v => ({
            verseId: v.verseId,
            book: v.book,
            chapter: v.chapter,
            verse: v.verse,
            snippet: v.versions.KJV?.text ?? '',
            matchedTerms: [],
            versionId: 'KJV',
        }))
    }

    // Strong's number
    if (parsedQuery.type === 'strongs') {
        const isGreek = parsedQuery.language === 'greek'
        const wordsFile = isGreek ? 'gnt-words.json' : 'ot-words.json'
        const sn = `${isGreek ? 'G' : 'H'}${parsedQuery.number}`
        const [words, kjvVerses] = await Promise.all([
            loadJSON(wordsFile).catch(() => ({})),
            loadJSON('kjv.json'),
        ])
        return Object.entries(words)
            .filter(([, verseWords]) => verseWords.some(w => w.strongsNumber === sn))
            .slice(0, 200)
            .map(([id]) => {
                const [bookId, chapter, verse] = id.split('.')
                return {
                    verseId: id,
                    book: ID_TO_BOOK_NAME[bookId] ?? bookId,
                    chapter: parseInt(chapter),
                    verse: parseInt(verse),
                    snippet: kjvVerses[id] ?? '',
                    matchedTerms: [sn],
                    versionId: 'KJV',
                }
            })
    }

    // Keyword search
    if (parsedQuery.type === 'keyword') {
        const kjvVerses = await loadJSON('kjv.json')
        const { terms, excludeTerms, operator } = parsedQuery
        return Object.entries(kjvVerses)
            .filter(([, text]) => {
                const lower = text.toLowerCase()
                if (excludeTerms.some(t => lower.includes(t))) return false
                return operator === 'OR'
                    ? terms.some(t => lower.includes(t))
                    : terms.every(t => lower.includes(t))
            })
            .slice(0, 100)
            .map(([id, text]) => {
                const [bookId, chapter, verse] = id.split('.')
                return {
                    verseId: id,
                    book: ID_TO_BOOK_NAME[bookId] ?? bookId,
                    chapter: parseInt(chapter),
                    verse: parseInt(verse),
                    snippet: text,
                    matchedTerms: parsedQuery.terms,
                    versionId: 'KJV',
                }
            })
    }

    return []
}

function mockSearch(parsedQuery, activeVersionIds, MOCK_VERSES, MOCK_SEARCH_RESULTS) {
    if (parsedQuery.type === 'passage') {
        return MOCK_VERSES
            .filter(v => v.book === parsedQuery.book)
            .filter(v => parsedQuery.chapter ? v.chapter === parsedQuery.chapter : true)
            .filter(v => parsedQuery.verseStart ? v.verse >= parsedQuery.verseStart : true)
            .filter(v => parsedQuery.verseEnd ? v.verse <= parsedQuery.verseEnd : true)
            .map(verse => ({
                verseId: verse.verseId, book: verse.book, chapter: verse.chapter, verse: verse.verse,
                snippet: verse.versions[activeVersionIds[0]]?.text ?? '',
                matchedTerms: [], versionId: activeVersionIds[0] ?? 'KJV',
            }))
    }
    if (parsedQuery.type === 'keyword') {
        const { terms, excludeTerms, operator } = parsedQuery
        return MOCK_VERSES
            .filter(verse => {
                const text = Object.values(verse.versions).map(v => v.text).join(' ').toLowerCase()
                if (excludeTerms.some(t => text.includes(t))) return false
                return operator === 'OR' ? terms.some(t => text.includes(t)) : terms.every(t => text.includes(t))
            })
            .map(verse => ({
                verseId: verse.verseId, book: verse.book, chapter: verse.chapter, verse: verse.verse,
                snippet: verse.versions[activeVersionIds[0]]?.text ?? '',
                matchedTerms: parsedQuery.terms, versionId: activeVersionIds[0] ?? 'KJV',
            }))
    }
    return MOCK_SEARCH_RESULTS
}

// ── Strong's ──────────────────────────────────────────────────────────────────

export async function fetchStrongs(strongsNumber) {
    if (!strongsNumber) return null
    if (DATA_SOURCE === 'mock') {
        const { MOCK_STRONGS } = await getMockData()
        return MOCK_STRONGS[strongsNumber] ?? null
    }
    if (DATA_SOURCE === 'json') {
        const isGreek = strongsNumber.startsWith('G')
        const dict = await loadJSON(isGreek ? 'strongs-greek.json' : 'strongs-hebrew.json').catch(() => ({}))
        return dict[strongsNumber] ?? null
    }
    return apiFetch(`/strongs/${strongsNumber}`)
}

export async function fetchStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    if (!strongsNumber) return []
    if (DATA_SOURCE === 'mock') {
        const { MOCK_SEARCH_RESULTS } = await getMockData()
        return MOCK_SEARCH_RESULTS
    }
    if (DATA_SOURCE === 'json') {
        const isGreek = strongsNumber.startsWith('G')
        const [words, kjvVerses] = await Promise.all([
            loadJSON(isGreek ? 'gnt-words.json' : 'ot-words.json').catch(() => ({})),
            loadJSON('kjv.json'),
        ])
        return Object.entries(words)
            .filter(([, verseWords]) => verseWords.some(w => w.strongsNumber === strongsNumber))
            .slice(0, 200)
            .map(([id]) => {
                const [bookId, chapter, verse] = id.split('.')
                return {
                    verseId: id, book: ID_TO_BOOK_NAME[bookId] ?? bookId,
                    chapter: parseInt(chapter), verse: parseInt(verse),
                    snippet: kjvVerses[id] ?? '', matchedTerms: [strongsNumber], versionId: 'KJV',
                }
            })
    }
    return apiFetch(`/strongs/${strongsNumber}/occurrences`, { versions: activeVersionIds.join(',') })
}
