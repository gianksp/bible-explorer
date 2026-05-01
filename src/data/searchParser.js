// searchParser.js
// Parses BibleGateway-compatible reference formats.
//
// Supported formats:
//   John 3:16          — single verse
//   John 3:16-18       — verse range
//   John 3             — whole chapter
//   John 3.16          — period as chapter:verse separator
//   jn3:16             — no space
//   Gen 1:1, 3         — non-consecutive verses (comma = same chapter context)
//   Gen 1:1-3, 5       — mixed range + single
//   Gen 1:1; Matt 5:1  — semicolon = separate passages
//   Matt 6:16, 18; 17:21 — mixed
//   G3056 / H430       — Strong's number
//   love OR faith      — keyword search
//   "in the beginning" — exact phrase
//   love -hate         — keyword exclude

// ── Book alias table ──────────────────────────────────────────────────────────

const BOOK_ALIASES = {
    // Genesis
    genesis: 'Genesis', gen: 'Genesis', ge: 'Genesis', gn: 'Genesis',
    // Exodus
    exodus: 'Exodus', ex: 'Exodus', exo: 'Exodus', exod: 'Exodus',
    // Leviticus
    leviticus: 'Leviticus', lev: 'Leviticus', le: 'Leviticus', lv: 'Leviticus',
    // Numbers
    numbers: 'Numbers', num: 'Numbers', nu: 'Numbers', nm: 'Numbers', nb: 'Numbers',
    // Deuteronomy
    deuteronomy: 'Deuteronomy', deut: 'Deuteronomy', deu: 'Deuteronomy', de: 'Deuteronomy', dt: 'Deuteronomy',
    // Joshua
    joshua: 'Joshua', josh: 'Joshua', jos: 'Joshua', jsh: 'Joshua',
    // Judges
    judges: 'Judges', judg: 'Judges', jdg: 'Judges', jg: 'Judges', jdgs: 'Judges',
    // Ruth
    ruth: 'Ruth', ru: 'Ruth', rut: 'Ruth',
    // 1 Samuel
    '1samuel': '1 Samuel', '1sam': '1 Samuel', '1sa': '1 Samuel', '1s': '1 Samuel',
    'isam': '1 Samuel', 'isamuel': '1 Samuel', '1stsamuel': '1 Samuel', 'firstsamuel': '1 Samuel',
    // 2 Samuel
    '2samuel': '2 Samuel', '2sam': '2 Samuel', '2sa': '2 Samuel',
    'iisamuel': '2 Samuel', '2ndsamuel': '2 Samuel', 'secondsamuel': '2 Samuel',
    // 1 Kings
    '1kings': '1 Kings', '1kgs': '1 Kings', '1ki': '1 Kings', '1k': '1 Kings',
    'ikings': '1 Kings', '1stkings': '1 Kings', 'firstkings': '1 Kings',
    // 2 Kings
    '2kings': '2 Kings', '2kgs': '2 Kings', '2ki': '2 Kings',
    'iikings': '2 Kings', '2ndkings': '2 Kings', 'secondkings': '2 Kings',
    // 1 Chronicles
    '1chronicles': '1 Chronicles', '1chr': '1 Chronicles', '1ch': '1 Chronicles',
    'ichronicles': '1 Chronicles', '1stchronicles': '1 Chronicles',
    // 2 Chronicles
    '2chronicles': '2 Chronicles', '2chr': '2 Chronicles', '2ch': '2 Chronicles',
    'iichronicles': '2 Chronicles', '2ndchronicles': '2 Chronicles',
    // Ezra
    ezra: 'Ezra', ezr: 'Ezra',
    // Nehemiah
    nehemiah: 'Nehemiah', neh: 'Nehemiah', ne: 'Nehemiah',
    // Esther
    esther: 'Esther', esth: 'Esther', est: 'Esther', es: 'Esther',
    // Job
    job: 'Job', jb: 'Job',
    // Psalms
    psalms: 'Psalms', psalm: 'Psalms', ps: 'Psalms', psa: 'Psalms', psm: 'Psalms', pss: 'Psalms',
    // Proverbs
    proverbs: 'Proverbs', prov: 'Proverbs', pro: 'Proverbs', prv: 'Proverbs', pr: 'Proverbs',
    // Ecclesiastes
    ecclesiastes: 'Ecclesiastes', eccl: 'Ecclesiastes', ecc: 'Ecclesiastes', ec: 'Ecclesiastes',
    qoh: 'Ecclesiastes', qoheleth: 'Ecclesiastes',
    // Song of Solomon
    'songofsolomon': 'Song of Solomon', 'songofsongs': 'Song of Solomon',
    song: 'Song of Solomon', sng: 'Song of Solomon', sos: 'Song of Solomon',
    canticles: 'Song of Solomon', cant: 'Song of Solomon',
    // Isaiah
    isaiah: 'Isaiah', isa: 'Isaiah', is: 'Isaiah',
    // Jeremiah
    jeremiah: 'Jeremiah', jer: 'Jeremiah', je: 'Jeremiah', jr: 'Jeremiah',
    // Lamentations
    lamentations: 'Lamentations', lam: 'Lamentations', la: 'Lamentations',
    // Ezekiel
    ezekiel: 'Ezekiel', ezek: 'Ezekiel', eze: 'Ezekiel', ezk: 'Ezekiel',
    // Daniel
    daniel: 'Daniel', dan: 'Daniel', da: 'Daniel', dn: 'Daniel',
    // Hosea
    hosea: 'Hosea', hos: 'Hosea', ho: 'Hosea',
    // Joel
    joel: 'Joel', joe: 'Joel', jl: 'Joel',
    // Amos
    amos: 'Amos', amo: 'Amos', am: 'Amos',
    // Obadiah
    obadiah: 'Obadiah', obad: 'Obadiah', ob: 'Obadiah',
    // Jonah
    jonah: 'Jonah', jon: 'Jonah', jnh: 'Jonah',
    // Micah
    micah: 'Micah', mic: 'Micah', mc: 'Micah',
    // Nahum
    nahum: 'Nahum', nah: 'Nahum', na: 'Nahum',
    // Habakkuk
    habakkuk: 'Habakkuk', hab: 'Habakkuk', hb: 'Habakkuk',
    // Zephaniah
    zephaniah: 'Zephaniah', zeph: 'Zephaniah', zep: 'Zephaniah', zp: 'Zephaniah',
    // Haggai
    haggai: 'Haggai', hag: 'Haggai', hg: 'Haggai',
    // Zechariah
    zechariah: 'Zechariah', zech: 'Zechariah', zec: 'Zechariah', zc: 'Zechariah',
    // Malachi
    malachi: 'Malachi', mal: 'Malachi', ml: 'Malachi',
    // Matthew
    matthew: 'Matthew', matt: 'Matthew', mat: 'Matthew', mt: 'Matthew',
    // Mark
    mark: 'Mark', mrk: 'Mark', mk: 'Mark', mr: 'Mark',
    // Luke
    luke: 'Luke', luk: 'Luke', lk: 'Luke',
    // John
    john: 'John', jhn: 'John', jn: 'John', joh: 'John',
    // Acts
    acts: 'Acts', act: 'Acts', ac: 'Acts',
    // Romans
    romans: 'Romans', rom: 'Romans', ro: 'Romans', rm: 'Romans',
    // 1 Corinthians
    '1corinthians': '1 Corinthians', '1cor': '1 Corinthians', '1co': '1 Corinthians',
    'icorinthians': '1 Corinthians', 'icor': '1 Corinthians', '1stcorinthians': '1 Corinthians',
    // 2 Corinthians
    '2corinthians': '2 Corinthians', '2cor': '2 Corinthians', '2co': '2 Corinthians',
    'iicorinthians': '2 Corinthians', 'iicor': '2 Corinthians', '2ndcorinthians': '2 Corinthians',
    // Galatians
    galatians: 'Galatians', gal: 'Galatians', ga: 'Galatians',
    // Ephesians
    ephesians: 'Ephesians', eph: 'Ephesians', ep: 'Ephesians',
    // Philippians
    philippians: 'Philippians', phil: 'Philippians', php: 'Philippians', pp: 'Philippians',
    // Colossians
    colossians: 'Colossians', col: 'Colossians',
    // 1 Thessalonians
    '1thessalonians': '1 Thessalonians', '1thess': '1 Thessalonians', '1thes': '1 Thessalonians', '1th': '1 Thessalonians',
    'ithessalonians': '1 Thessalonians', '1stthessalonians': '1 Thessalonians',
    // 2 Thessalonians
    '2thessalonians': '2 Thessalonians', '2thess': '2 Thessalonians', '2thes': '2 Thessalonians', '2th': '2 Thessalonians',
    'iithessalonians': '2 Thessalonians', '2ndthessalonians': '2 Thessalonians',
    // 1 Timothy
    '1timothy': '1 Timothy', '1tim': '1 Timothy', '1ti': '1 Timothy',
    'itimothy': '1 Timothy', 'itim': '1 Timothy', '1sttimothy': '1 Timothy',
    // 2 Timothy
    '2timothy': '2 Timothy', '2tim': '2 Timothy', '2ti': '2 Timothy',
    'iitimothy': '2 Timothy', 'iitim': '2 Timothy', '2ndtimothy': '2 Timothy',
    // Titus
    titus: 'Titus', tit: 'Titus', ti: 'Titus',
    // Philemon
    philemon: 'Philemon', phlm: 'Philemon', phm: 'Philemon', pm: 'Philemon',
    // Hebrews
    hebrews: 'Hebrews', heb: 'Hebrews', he: 'Hebrews',
    // James
    james: 'James', jas: 'James', jm: 'James',
    // 1 Peter
    '1peter': '1 Peter', '1pet': '1 Peter', '1pe': '1 Peter',
    'ipeter': '1 Peter', 'ipet': '1 Peter', '1stpeter': '1 Peter',
    // 2 Peter
    '2peter': '2 Peter', '2pet': '2 Peter', '2pe': '2 Peter',
    'iipeter': '2 Peter', 'iipet': '2 Peter', '2ndpeter': '2 Peter',
    // 1 John
    '1john': '1 John', '1jn': '1 John', '1jo': '1 John',
    'ijohn': '1 John', 'ijn': '1 John', '1stjohn': '1 John',
    // 2 John
    '2john': '2 John', '2jn': '2 John', '2jo': '2 John',
    'iijohn': '2 John', 'iijn': '2 John', '2ndjohn': '2 John',
    // 3 John
    '3john': '3 John', '3jn': '3 John', '3jo': '3 John',
    'iiijohn': '3 John', 'iiijn': '3 John', '3rdjohn': '3 John',
    // Jude
    jude: 'Jude', jud: 'Jude', jd: 'Jude',
    // Revelation
    revelation: 'Revelation', rev: 'Revelation', re: 'Revelation', rv: 'Revelation',
    apocalypse: 'Revelation', apoc: 'Revelation',
}

// Normalize raw book string → canonical full name
// Handles: 'psalm'→'Psalms', 'Rev.'→'Revelation', '1 Cor'→'1 Corinthians'
export function normalizeBookName(raw) {
    if (!raw) return ''
    const key = raw.trim()
        .toLowerCase()
        .replace(/\./g, '')       // strip periods
        .replace(/\s+/g, '')      // strip spaces
    return BOOK_ALIASES[key] ?? raw.trim()
}

// ── Normalize raw query ───────────────────────────────────────────────────────
// Converts alternative formats to a standard form before parsing:
//   jn3:16        → jn 3:16
//   John 3.16     → John 3:16
//   Rev. 5:1      → Rev 5:1
//   1Cor13:4      → 1Cor 13:4

function normalizeQuery(raw) {
    return raw
        .trim()
        // Period between digits = chapter:verse separator → colon
        .replace(/(\d)\.(\d)/g, '$1:$2')
        // Strip trailing/abbreviation periods NOT between digits
        .replace(/\.(?!\d)/g, ' ')
        // No-space book+chapter: jn3:16 → jn 3:16 (letter followed by digit)
        .replace(/([a-z])(\d)/gi, '$1 $2')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        .trim()
}

// ── Book detection ────────────────────────────────────────────────────────────
// Returns { book, remainder } or null if no book found at start of string

function extractBook(str) {
    str = str.trim()

    // Try longest match first — up to 4 words
    // Handles: "Song of Solomon 1", "1 Corinthians 13", "John 3"
    for (let wordCount = 4; wordCount >= 1; wordCount--) {
        const words = str.split(' ')
        if (words.length < wordCount) continue
        const candidate = words.slice(0, wordCount).join('')
        const book = BOOK_ALIASES[candidate.toLowerCase()]
        if (book) {
            const remainder = words.slice(wordCount).join(' ').trim()
            return { book, remainder }
        }
    }
    return null
}

// ── Reference parser ──────────────────────────────────────────────────────────
// Parses the numeric part of a reference given a context {book, chapter}
// Returns array of passage objects

function parseRef(refStr, context) {
    const results = []
    const parts = refStr.split(',').map(s => s.trim()).filter(Boolean)

    for (const part of parts) {
        // Possible formats:
        //   "3:16"      chapter:verse
        //   "3:16-18"   chapter:verse-verse
        //   "12:31-13:13" cross-chapter range
        //   "16"        verse (if chapter known) or chapter (if no chapter)
        //   "16-18"     verse range or chapter range

        const chVerseRange = part.match(/^(\d+):(\d+)-(\d+):(\d+)$/)  // 12:31-13:13
        const chVerse = part.match(/^(\d+):(\d+)(?:-(\d+))?$/)   // 3:16 or 3:16-18
        const numRange = part.match(/^(\d+)-(\d+)$/)               // 16-18
        const numOnly = part.match(/^(\d+)$/)                     // 16

        if (chVerseRange) {
            context.chapter = parseInt(chVerseRange[1])
            const verseStart = parseInt(chVerseRange[2])
            const verseEnd = parseInt(chVerseRange[4])
            results.push({ book: context.book, chapter: context.chapter, verseStart, verseEnd })
            context.chapter = parseInt(chVerseRange[3]) // update to end chapter

        } else if (chVerse) {
            context.chapter = parseInt(chVerse[1])
            const verseStart = parseInt(chVerse[2])
            const verseEnd = chVerse[3] ? parseInt(chVerse[3]) : null
            results.push({ book: context.book, chapter: context.chapter, verseStart, verseEnd })

        } else if (numRange) {
            const a = parseInt(numRange[1])
            const b = parseInt(numRange[2])
            if (context.chapter !== null) {
                // We have a chapter — treat as verse range
                results.push({ book: context.book, chapter: context.chapter, verseStart: a, verseEnd: b })
            } else {
                // No chapter — treat as chapter range
                results.push({ book: context.book, chapter: a, verseStart: null, verseEnd: null })
                // Only show first chapter for simplicity (like BG chapter range shows all)
                context.chapter = a
            }

        } else if (numOnly) {
            const n = parseInt(numOnly[1])
            if (context.chapter !== null) {
                // Have chapter — this is a verse
                results.push({ book: context.book, chapter: context.chapter, verseStart: n, verseEnd: null })
            } else {
                // No chapter — this is a chapter
                context.chapter = n
                results.push({ book: context.book, chapter: n, verseStart: null, verseEnd: null })
            }
        }
    }

    return results
}

// ── Main export ───────────────────────────────────────────────────────────────

export function parseSearch(rawQuery) {
    if (!rawQuery?.trim()) return null

    // Strong's number — G3056 or H430
    const strongsMatch = rawQuery.trim().match(/^([GgHh])(\d{1,4})$/)
    if (strongsMatch) {
        return {
            type: 'strongs',
            language: strongsMatch[1].toUpperCase() === 'G' ? 'greek' : 'hebrew',
            number: parseInt(strongsMatch[2], 10),
            raw: rawQuery,
        }
    }

    const normalized = normalizeQuery(rawQuery)

    // Check if it looks like a passage reference
    // Must start with a book-like token (letter or digit+letter)
    const looksLikePassage = /^(\d?\s?[a-z])/i.test(normalized) && extractBook(normalized) !== null

    if (!looksLikePassage) {
        return parseKeywordSearch(rawQuery)
    }

    // Split on semicolons — each segment is an independent passage group
    const segments = normalized.split(';').map(s => s.trim()).filter(Boolean)
    const passages = []
    const context = { book: null, chapter: null }

    for (const segment of segments) {
        // Reset chapter on new semicolon group but keep book
        const segContext = { book: context.book, chapter: null }

        // Try to extract book from start of segment
        const bookResult = extractBook(segment)
        if (bookResult) {
            segContext.book = bookResult.book
            const refs = parseRef(bookResult.remainder, segContext)
            if (refs.length === 0 && bookResult.remainder === '') {
                // Just a book name
                passages.push({ book: segContext.book, chapter: null, verseStart: null, verseEnd: null })
            } else {
                passages.push(...refs)
            }
        } else if (segContext.book) {
            // No book found but we have context — parse as continuation
            const refs = parseRef(segment, segContext)
            passages.push(...refs)
        }

        context.book = segContext.book
        context.chapter = segContext.chapter
    }

    const validPassages = passages.filter(p => p.book)

    if (validPassages.length === 0) return parseKeywordSearch(rawQuery)

    if (validPassages.length === 1) {
        return { type: 'passage', ...validPassages[0], raw: rawQuery }
    }

    return { type: 'multi-passage', passages: validPassages, raw: rawQuery }
}

// ── Keyword search ────────────────────────────────────────────────────────────

function parseKeywordSearch(query) {
    const exactPhrases = []
    const withoutPhrases = query.replace(/"([^"]+)"/g, (_, phrase) => {
        exactPhrases.push(phrase.toLowerCase())
        return ''
    })

    const tokens = withoutPhrases.trim().split(/\s+/).filter(Boolean)
    const operator = tokens.includes('OR') ? 'OR' : 'AND'
    const terms = []
    const excludeTerms = []

    for (const token of tokens) {
        if (token === 'OR' || token === 'AND') continue
        if (token.startsWith('-')) excludeTerms.push(token.slice(1).toLowerCase())
        else terms.push(token.toLowerCase())
    }

    return {
        type: 'keyword',
        terms: [...exactPhrases, ...terms],
        excludeTerms,
        exactPhrases,
        operator,
        raw: query,
    }
}
