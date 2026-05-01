/**
 * Bible Data Processor — STEPBible TAGNT/TAHOT Edition
 *
 * SOURCE FILES in public/data/source/:
 *   KJVA.json
 *   strongs-greek-dictionary.js
 *   strongs-hebrew-dictionary.js
 *   stepbible/Translators Amalgamated OT+NT/TAGNT Mat-Jhn*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAGNT Act-Rev*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Gen-Deu*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Jos-Est*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Job-Sng*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Isa-Mal*.txt
 *
 * RUN: node process-bible-data.mjs
 * OUTPUT: public/data/*.json
 */

import fs from 'fs'
import path from 'path'

const SOURCE = './public/data/source'
const STEPBIBLE = `${SOURCE}/stepbible/Translators Amalgamated OT+NT`
const OUTPUT = './public/data'

fs.mkdirSync(OUTPUT, { recursive: true })

// ── Book tables ───────────────────────────────────────────────────────────────

const BOOKS = [
    { id: 'Gen', name: 'Genesis', testament: 'OT', chapters: 50 },
    { id: 'Ex', name: 'Exodus', testament: 'OT', chapters: 40 },
    { id: 'Lev', name: 'Leviticus', testament: 'OT', chapters: 27 },
    { id: 'Num', name: 'Numbers', testament: 'OT', chapters: 36 },
    { id: 'Deut', name: 'Deuteronomy', testament: 'OT', chapters: 34 },
    { id: 'Josh', name: 'Joshua', testament: 'OT', chapters: 24 },
    { id: 'Judg', name: 'Judges', testament: 'OT', chapters: 21 },
    { id: 'Ruth', name: 'Ruth', testament: 'OT', chapters: 4 },
    { id: '1Sam', name: '1 Samuel', testament: 'OT', chapters: 31 },
    { id: '2Sam', name: '2 Samuel', testament: 'OT', chapters: 24 },
    { id: '1Kgs', name: '1 Kings', testament: 'OT', chapters: 22 },
    { id: '2Kgs', name: '2 Kings', testament: 'OT', chapters: 25 },
    { id: '1Chr', name: '1 Chronicles', testament: 'OT', chapters: 29 },
    { id: '2Chr', name: '2 Chronicles', testament: 'OT', chapters: 36 },
    { id: 'Ezra', name: 'Ezra', testament: 'OT', chapters: 10 },
    { id: 'Neh', name: 'Nehemiah', testament: 'OT', chapters: 13 },
    { id: 'Esth', name: 'Esther', testament: 'OT', chapters: 10 },
    { id: 'Job', name: 'Job', testament: 'OT', chapters: 42 },
    { id: 'Ps', name: 'Psalms', testament: 'OT', chapters: 150 },
    { id: 'Prov', name: 'Proverbs', testament: 'OT', chapters: 31 },
    { id: 'Eccl', name: 'Ecclesiastes', testament: 'OT', chapters: 12 },
    { id: 'Song', name: 'Song of Solomon', testament: 'OT', chapters: 8 },
    { id: 'Isa', name: 'Isaiah', testament: 'OT', chapters: 66 },
    { id: 'Jer', name: 'Jeremiah', testament: 'OT', chapters: 52 },
    { id: 'Lam', name: 'Lamentations', testament: 'OT', chapters: 5 },
    { id: 'Ezek', name: 'Ezekiel', testament: 'OT', chapters: 48 },
    { id: 'Dan', name: 'Daniel', testament: 'OT', chapters: 12 },
    { id: 'Hos', name: 'Hosea', testament: 'OT', chapters: 14 },
    { id: 'Joel', name: 'Joel', testament: 'OT', chapters: 3 },
    { id: 'Amos', name: 'Amos', testament: 'OT', chapters: 9 },
    { id: 'Obad', name: 'Obadiah', testament: 'OT', chapters: 1 },
    { id: 'Jonah', name: 'Jonah', testament: 'OT', chapters: 4 },
    { id: 'Mic', name: 'Micah', testament: 'OT', chapters: 7 },
    { id: 'Nah', name: 'Nahum', testament: 'OT', chapters: 3 },
    { id: 'Hab', name: 'Habakkuk', testament: 'OT', chapters: 3 },
    { id: 'Zeph', name: 'Zephaniah', testament: 'OT', chapters: 3 },
    { id: 'Hag', name: 'Haggai', testament: 'OT', chapters: 2 },
    { id: 'Zech', name: 'Zechariah', testament: 'OT', chapters: 14 },
    { id: 'Mal', name: 'Malachi', testament: 'OT', chapters: 4 },
    { id: 'Matt', name: 'Matthew', testament: 'NT', chapters: 28 },
    { id: 'Mark', name: 'Mark', testament: 'NT', chapters: 16 },
    { id: 'Luke', name: 'Luke', testament: 'NT', chapters: 24 },
    { id: 'John', name: 'John', testament: 'NT', chapters: 21 },
    { id: 'Acts', name: 'Acts', testament: 'NT', chapters: 28 },
    { id: 'Rom', name: 'Romans', testament: 'NT', chapters: 16 },
    { id: '1Cor', name: '1 Corinthians', testament: 'NT', chapters: 16 },
    { id: '2Cor', name: '2 Corinthians', testament: 'NT', chapters: 13 },
    { id: 'Gal', name: 'Galatians', testament: 'NT', chapters: 6 },
    { id: 'Eph', name: 'Ephesians', testament: 'NT', chapters: 6 },
    { id: 'Phil', name: 'Philippians', testament: 'NT', chapters: 4 },
    { id: 'Col', name: 'Colossians', testament: 'NT', chapters: 4 },
    { id: '1Th', name: '1 Thessalonians', testament: 'NT', chapters: 5 },
    { id: '2Th', name: '2 Thessalonians', testament: 'NT', chapters: 3 },
    { id: '1Tim', name: '1 Timothy', testament: 'NT', chapters: 6 },
    { id: '2Tim', name: '2 Timothy', testament: 'NT', chapters: 4 },
    { id: 'Titus', name: 'Titus', testament: 'NT', chapters: 3 },
    { id: 'Phlm', name: 'Philemon', testament: 'NT', chapters: 1 },
    { id: 'Heb', name: 'Hebrews', testament: 'NT', chapters: 13 },
    { id: 'Jas', name: 'James', testament: 'NT', chapters: 5 },
    { id: '1Pet', name: '1 Peter', testament: 'NT', chapters: 5 },
    { id: '2Pet', name: '2 Peter', testament: 'NT', chapters: 3 },
    { id: '1Jn', name: '1 John', testament: 'NT', chapters: 5 },
    { id: '2Jn', name: '2 John', testament: 'NT', chapters: 1 },
    { id: '3Jn', name: '3 John', testament: 'NT', chapters: 1 },
    { id: 'Jude', name: 'Jude', testament: 'NT', chapters: 1 },
    { id: 'Rev', name: 'Revelation', testament: 'NT', chapters: 22 },
]

const NAME_TO_ID = Object.fromEntries(BOOKS.map(b => [b.name, b.id]))

// STEPBible uses 3-letter abbreviations — map to our book IDs
const STEP_TO_ID = {
    'Gen': 'Gen', 'Exo': 'Ex', 'Lev': 'Lev', 'Num': 'Num', 'Deu': 'Deut',
    'Jos': 'Josh', 'Jdg': 'Judg', 'Rut': 'Ruth', '1Sa': '1Sam', '2Sa': '2Sam',
    '1Ki': '1Kgs', '2Ki': '2Kgs', '1Ch': '1Chr', '2Ch': '2Chr',
    'Ezr': 'Ezra', 'Neh': 'Neh', 'Est': 'Esth', 'Job': 'Job', 'Psa': 'Ps',
    'Pro': 'Prov', 'Ecc': 'Eccl', 'Sng': 'Song', 'Isa': 'Isa', 'Jer': 'Jer',
    'Lam': 'Lam', 'Eze': 'Ezek', 'Dan': 'Dan', 'Hos': 'Hos', 'Joe': 'Joel',
    'Amo': 'Amos', 'Oba': 'Obad', 'Jon': 'Jonah', 'Mic': 'Mic', 'Nah': 'Nah',
    'Hab': 'Hab', 'Zep': 'Zeph', 'Hag': 'Hag', 'Zec': 'Zech', 'Mal': 'Mal',
    'Mat': 'Matt', 'Mrk': 'Mark', 'Luk': 'Luke', 'Jhn': 'John', 'Act': 'Acts',
    'Rom': 'Rom', '1Co': '1Cor', '2Co': '2Cor', 'Gal': 'Gal', 'Eph': 'Eph',
    'Php': 'Phil', 'Col': 'Col', '1Th': '1Th', '2Th': '2Th', '1Ti': '1Tim',
    '2Ti': '2Tim', 'Tit': 'Titus', 'Phm': 'Phlm', 'Heb': 'Heb', 'Jas': 'Jas',
    '1Pe': '1Pet', '2Pe': '2Pet', '1Jn': '1Jn', '2Jn': '2Jn', '3Jn': '3Jn',
    'Jud': 'Jude', 'Rev': 'Rev',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function write(filename, data) {
    const fp = `${OUTPUT}/${filename}`
    fs.writeFileSync(fp, JSON.stringify(data))
    const kb = (fs.statSync(fp).size / 1024).toFixed(1)
    console.log(`  ✓ ${filename} (${kb} KB)`)
}

function cleanDef(raw) {
    return (raw ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function extractJSON(raw) {
    const first = raw.indexOf('{')
    const last = raw.lastIndexOf('}')
    if (first === -1) throw new Error('No JSON object found')
    return raw.slice(first, last + 1)
}

// Find a file in a directory matching a prefix pattern
function findFile(dir, prefix) {
    const files = fs.readdirSync(dir)
    const found = files.find(f => f.startsWith(prefix))
    if (!found) throw new Error(`No file starting with "${prefix}" in ${dir}`)
    return path.join(dir, found)
}

// Parse a STEPBible ref like "Mat.1.1#01=NKO" → { bookId, chapter, verse }
function parseStepRef(refField) {
    // refField = "Mat.1.1#01=NKO"
    const refPart = refField.split('#')[0]           // "Mat.1.1"
    const parts = refPart.split('.')
    const stepBook = parts[0]                          // "Mat"
    const bookId = STEP_TO_ID[stepBook]
    const chapter = parseInt(parts[1])
    const verse = parseInt(parts[2])
    return { bookId, chapter, verse }
}

// Add this helper function near the top with other helpers:
function normalizeStrongs(raw) {
    // Strips trailing letter qualifiers and leading zeros from number
    // H0430G → H430, G0976 → G976
    const match = raw.match(/([GH])0*(\d+)/)
    if (!match) return raw
    return `${match[1]}${match[2]}`
}

// Parse STEPBible TAGNT/TAHOT line into word object
// Tab-separated columns:
// 0: ref#wordnum=type   e.g. Mat.1.1#01=NKO
// 1: Greek/Hebrew (translit)  e.g. Βίβλος (Biblos)
// 2: English gloss     e.g. [The] book
// 3: Strongs=Grammar   e.g. G0976=N-NSF
// 4: lemma=meaning     e.g. βίβλος=book
// (further columns ignored)

function parseStepLine(line) {
    const cols = line.split('\t')
    if (cols.length < 4) return null

    const refField = cols[0].trim()
    if (!refField.includes('.')) return null

    const { bookId, chapter, verse } = parseStepRef(refField)
    if (!bookId || !chapter || !verse) return null

    // WITH this:
    const OT_BOOK_ABBREVS = new Set([
        'Gen', 'Exo', 'Lev', 'Num', 'Deu', 'Jos', 'Jdg', 'Rut',
        '1Sa', '2Sa', '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Neh', 'Est', 'Job', 'Psa',
        'Pro', 'Ecc', 'Sng', 'Isa', 'Jer', 'Lam', 'Eze', 'Dan', 'Hos', 'Joe', 'Amo',
        'Oba', 'Jon', 'Mic', 'Nah', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal'
    ])
    const isHebrew = OT_BOOK_ABBREVS.has(refField.split('.')[0])

    let surface, transliteration, englishGloss, strongsNumber, morphology, shortDef

    if (isHebrew) {
        // TAHOT columns:
        // 0: ref   1: Hebrew surface   2: translit   3: English
        // 4: Strongs (compound H9003/{H7225G})   5: morphology   9: main Strongs

        // Surface — strip prefix slash marker
        surface = (cols[1]?.trim() ?? '').replace('/', '')

        // Transliteration from col 2 — clean up dots and slashes
        transliteration = (cols[2]?.trim() ?? '')
            .replace(/\//g, ' ').replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase()

        // English from col 3 — clean up slashes
        englishGloss = (cols[3]?.trim() ?? '')
            .replace(/\//g, ' ').replace(/\s+/g, ' ').replace(/[\[\]]/g, '').trim()

        // Strong's — col 9 is the cleanest single strongs number
        const col9 = cols[9]?.trim() ?? ''
        const col4 = cols[4]?.trim() ?? ''
        if (col9.match(/^H\d+/)) {
            // Strip trailing letter qualifier like H7225G → H7225
            strongsNumber = normalizeStrongs(col9)
        } else {
            // Parse from col4: H9003/{H7225G} → H7225
            const braceMatch = col4.match(/\{H(\d+)/)
            const directMatch = col4.match(/^H(\d+)/)
            strongsNumber = braceMatch
                ? normalizeStrongs(`H${braceMatch[1]}`)
                : directMatch ? normalizeStrongs(`H${directMatch[1]}`) : ''
        }

        // Morphology from col 5
        morphology = cols[5]?.trim() ?? ''
        shortDef = ''

    } else {
        // TAGNT columns:
        // 0: ref   1: Greek (translit)   2: English   3: Strongs=Grammar   4: lemma=meaning

        const wordCol = cols[1]?.trim() ?? ''
        const transitMatch = wordCol.match(/^(.+?)\s*\(([^)]+)\)/)
        surface = transitMatch ? transitMatch[1].trim() : wordCol.split(' ')[0]
        transliteration = transitMatch ? transitMatch[2].trim() : ''
        englishGloss = (cols[2]?.trim() ?? '').replace(/[\[\]]/g, '').trim()

        const strongsCol = cols[3]?.trim() ?? ''
        const strongsParts = strongsCol.split('=')
        const rawStrongs = strongsParts[0] ?? ''
        strongsNumber = normalizeStrongs(rawStrongs)
        morphology = strongsParts[1] ?? ''

        const lemmaCol = cols[4]?.trim() ?? ''
        shortDef = cleanDef(lemmaCol.split('=')[1] ?? '')
    }

    const verseId = `${bookId}.${chapter}.${verse}`

    return { verseId, surface, transliteration, englishGloss, strongsNumber, morphology, shortDef }
}

// Process a STEPBible TSV file → add words to wordsMap
function processStepFile(filePath, wordsMap, greekDict, hebrewDict) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')

    for (const line of lines) {
        // Skip header lines — data lines start with a book abbreviation
        if (!line.match(/^[A-Z][a-z]{2}\./)) continue

        const word = parseStepLine(line)
        if (!word) continue

        const { verseId, strongsNumber } = word
        if (!verseId) continue

        if (!wordsMap[verseId]) wordsMap[verseId] = []

        // Enrich with full definition from Strong's dictionary
        const isGreek = strongsNumber.startsWith('G')
        const dictEntry = isGreek ? greekDict[strongsNumber] : hebrewDict[strongsNumber]

        wordsMap[verseId].push({
            wordId: `${verseId}.${wordsMap[verseId].length + 1}`,
            surface: word.surface,
            transliteration: word.transliteration,
            strongsNumber: word.strongsNumber,
            morphology: word.morphology,
            englishGloss: word.englishGloss || word.shortDef,
            definition: dictEntry?.definition ?? word.shortDef,
        })
    }
}

// ── 1. KJV text ───────────────────────────────────────────────────────────────

console.log('\n[1/5] KJV text from KJVA.json...')
const kjvaRaw = JSON.parse(fs.readFileSync(`${SOURCE}/KJVA.json`, 'utf8'))
const kjv = {}

for (const book of kjvaRaw.books) {
    const bookId = NAME_TO_ID[book.name]
    if (!bookId) { console.warn(`  skip: ${book.name}`); continue }
    for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
            const clean = verse.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
            kjv[`${bookId}.${chapter.chapter}.${verse.verse}`] = clean
        }
    }
}

write('kjv.json', kjv)
console.log(`  ${Object.keys(kjv).length} verses`)

// ── 2. Strong's Greek dictionary ──────────────────────────────────────────────

console.log('\n[2/5] Strong\'s Greek dictionary...')
const gRaw = fs.readFileSync(`${SOURCE}/strongs-greek-dictionary.js`, 'utf8')
const greekDict = {}

for (const [key, e] of Object.entries(JSON.parse(extractJSON(gRaw)))) {
    const num = key.startsWith('G') ? key : `G${key}`
    greekDict[num] = {
        strongsNumber: num,
        language: 'greek',
        definition: cleanDef(e.strongs_def ?? e.kjv_def ?? ''),
        shortDef: cleanDef(e.kjv_def ?? ''),
    }
}

write('strongs-greek.json', greekDict)
console.log(`  ${Object.keys(greekDict).length} entries`)

// ── 3. Strong's Hebrew dictionary ────────────────────────────────────────────

console.log('\n[3/5] Strong\'s Hebrew dictionary...')
const hRaw = fs.readFileSync(`${SOURCE}/strongs-hebrew-dictionary.js`, 'utf8')
const hebrewDict = {}

for (const [key, e] of Object.entries(JSON.parse(extractJSON(hRaw)))) {
    const num = key.startsWith('H') ? key : `H${key}`
    hebrewDict[num] = {
        strongsNumber: num,
        transliteration: cleanDef(e.xlit ?? e.translit ?? ''),
        language: 'hebrew',
        definition: cleanDef(e.strongs_def ?? e.kjv_def ?? ''),
        shortDef: cleanDef(e.kjv_def ?? ''),
    }
}

write('strongs-hebrew.json', hebrewDict)
console.log(`  ${Object.keys(hebrewDict).length} entries`)

// ── 4. TAGNT — Greek NT ───────────────────────────────────────────────────────

console.log('\n[4/5] TAGNT Greek NT...')
const gntWords = {}

try {
    const tagntFiles = [
        findFile(STEPBIBLE, 'TAGNT Mat-Jhn'),
        findFile(STEPBIBLE, 'TAGNT Act-Rev'),
    ]

    for (const file of tagntFiles) {
        console.log(`  processing ${path.basename(file)}`)
        processStepFile(file, gntWords, greekDict, hebrewDict)
    }

    write('gnt-words.json', gntWords)
    console.log(`  ${Object.keys(gntWords).length} verses`)
} catch (e) {
    console.warn(`  TAGNT error: ${e.message}`)
    write('gnt-words.json', {})
}

// ── 5. TAHOT — Hebrew OT ─────────────────────────────────────────────────────

console.log('\n[5/5] TAHOT Hebrew OT...')
const otWords = {}

try {
    const tahotFiles = [
        findFile(STEPBIBLE, 'TAHOT Gen-Deu'),
        findFile(STEPBIBLE, 'TAHOT Jos-Est'),
        findFile(STEPBIBLE, 'TAHOT Job-Sng'),
        findFile(STEPBIBLE, 'TAHOT Isa-Mal'),
    ]

    for (const file of tahotFiles) {
        console.log(`  processing ${path.basename(file)}`)
        processStepFile(file, otWords, greekDict, hebrewDict)
    }

    write('ot-words.json', otWords)
    console.log(`  ${Object.keys(otWords).length} verses`)
} catch (e) {
    console.warn(`  TAHOT error: ${e.message}`)
    write('ot-words.json', {})
}

// ── Chapter index ─────────────────────────────────────────────────────────────

console.log('\nBuilding chapter index...')
const chapterIndex = {}
for (const id of Object.keys(kjv)) {
    const [bookId, chapterNum] = id.split('.')
    const key = `${bookId}.${chapterNum}`
    if (!chapterIndex[key]) chapterIndex[key] = []
    chapterIndex[key].push(id)
}
write('chapter-index.json', chapterIndex)
console.log(`  ${Object.keys(chapterIndex).length} chapters`)

// ── Books metadata ────────────────────────────────────────────────────────────

write('books.json', BOOKS)

console.log('\n✓ Done.')
console.log('\nOutput in public/data/:')
console.log('  kjv.json            — KJV verse text (31k verses)')
console.log('  strongs-greek.json  — Greek definitions')
console.log('  strongs-hebrew.json — Hebrew definitions')
console.log('  gnt-words.json      — Greek NT words with Strong\'s + surface text')
console.log('  ot-words.json       — Hebrew OT words with Strong\'s + surface text')
console.log('  chapter-index.json  — chapter navigation index')
console.log('  books.json          — book metadata')
console.log('\nNext: set DATA_SOURCE = "json" in src/data/apiClient.js')
