/**
 * Bible Data Processor
 *
 * SOURCE FILES in public/data/source/:
 *   KJVA.json                          — KJV with Apocrypha (scrollmapper)
 *   DRC.json                           — Douay-Rheims Challoner (scrollmapper)
 *   strongs-greek-dictionary.js        — openscriptures/strongs
 *   strongs-hebrew-dictionary.js       — openscriptures/strongs
 *   stepbible/Translators Amalgamated OT+NT/TAGNT Mat-Jhn*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAGNT Act-Rev*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Gen-Deu*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Jos-Est*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Job-Sng*.txt
 *   stepbible/Translators Amalgamated OT+NT/TAHOT Isa-Mal*.txt
 *
 * RUN: node process-bible-data.mjs
 * OUTPUT: public/data/*.json
 *
 * Adding a new translation:
 *   1. Download the source JSON (scrollmapper format)
 *   2. Add a processTranslation() call below
 *   3. Add to versions.js
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
    // Apocrypha
    { id: '1Esd', name: '1 Esdras', testament: 'OT', chapters: 9 },
    { id: '2Esd', name: '2 Esdras', testament: 'OT', chapters: 16 },
    { id: 'Tob', name: 'Tobit', testament: 'OT', chapters: 14 },
    { id: 'Jdt', name: 'Judith', testament: 'OT', chapters: 16 },
    { id: 'AddEst', name: 'Additions to Esther', testament: 'OT', chapters: 16 },
    { id: 'Wis', name: 'Wisdom', testament: 'OT', chapters: 19 },
    { id: 'Sir', name: 'Sirach', testament: 'OT', chapters: 51 },
    { id: 'Bar', name: 'Baruch', testament: 'OT', chapters: 6 },
    { id: 'PrAzar', name: 'Prayer of Azariah', testament: 'OT', chapters: 1 },
    { id: 'Sus', name: 'Susanna', testament: 'OT', chapters: 1 },
    { id: 'Bel', name: 'Bel and the Dragon', testament: 'OT', chapters: 1 },
    { id: 'PrMan', name: 'Prayer of Manasses', testament: 'OT', chapters: 1 },
    { id: '1Macc', name: '1 Maccabees', testament: 'OT', chapters: 16 },
    { id: '2Macc', name: '2 Maccabees', testament: 'OT', chapters: 15 },
    // NT
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

// KJVA uses Roman numerals and alternate names — map to our canonical IDs
const KJVA_NAME_ALIASES = {
    'I Samuel': '1Sam', 'II Samuel': '2Sam',
    'I Kings': '1Kgs', 'II Kings': '2Kgs',
    'I Chronicles': '1Chr', 'II Chronicles': '2Chr',
    'I Corinthians': '1Cor', 'II Corinthians': '2Cor',
    'I Thessalonians': '1Th', 'II Thessalonians': '2Th',
    'I Timothy': '1Tim', 'II Timothy': '2Tim',
    'I Peter': '1Pet', 'II Peter': '2Pet',
    'I John': '1Jn', 'II John': '2Jn', 'III John': '3Jn',
    'Revelation of John': 'Rev',
    // Apocrypha
    'I Esdras': '1Esd', 'II Esdras': '2Esd',
    'Tobit': 'Tob', 'Judith': 'Jdt',
    'Additions to Esther': 'AddEst',
    'Wisdom': 'Wis', 'Sirach': 'Sir', 'Baruch': 'Bar',
    'Prayer of Azariah': 'PrAzar', 'Susanna': 'Sus',
    'Bel and the Dragon': 'Bel', 'Prayer of Manasses': 'PrMan',
    'I Maccabees': '1Macc', 'II Maccabees': '2Macc',
}

const FULL_NAME_TO_ID = { ...NAME_TO_ID, ...KJVA_NAME_ALIASES }

// STEPBible 3-letter abbreviations → our book IDs
const STEP_TO_ID = {
    // OT
    'Gen': 'Gen', 'Exo': 'Ex', 'Lev': 'Lev', 'Num': 'Num', 'Deu': 'Deut',
    'Jos': 'Josh', 'Jdg': 'Judg', 'Rut': 'Ruth',
    '1Sa': '1Sam', '2Sa': '2Sam',
    '1Ki': '1Kgs', '2Ki': '2Kgs',
    '1Ch': '1Chr', '2Ch': '2Chr',
    'Ezr': 'Ezra', 'Neh': 'Neh', 'Est': 'Esth', 'Job': 'Job', 'Psa': 'Ps',
    'Pro': 'Prov', 'Ecc': 'Eccl', 'Sng': 'Song', 'Isa': 'Isa', 'Jer': 'Jer',
    'Lam': 'Lam', 'Eze': 'Ezek', 'Dan': 'Dan', 'Hos': 'Hos', 'Joe': 'Joel',
    'Amo': 'Amos', 'Oba': 'Obad', 'Jon': 'Jonah', 'Mic': 'Mic', 'Nah': 'Nah',
    'Hab': 'Hab', 'Zep': 'Zeph', 'Hag': 'Hag', 'Zec': 'Zech', 'Mal': 'Mal',
    // NT
    'Mat': 'Matt', 'Mrk': 'Mark', 'Luk': 'Luke', 'Jhn': 'John', 'Act': 'Acts',
    'Rom': 'Rom',
    '1Co': '1Cor', '2Co': '2Cor',
    'Gal': 'Gal', 'Eph': 'Eph', 'Php': 'Phil', 'Col': 'Col',
    '1Th': '1Th', '2Th': '2Th',
    '1Ti': '1Tim', '2Ti': '2Tim',
    'Tit': 'Titus', 'Phm': 'Phlm', 'Heb': 'Heb', 'Jas': 'Jas',
    '1Pe': '1Pet', '2Pe': '2Pet',
    '1Jn': '1Jn', '2Jn': '2Jn', '3Jn': '3Jn',
    'Jud': 'Jude', 'Rev': 'Rev',
    // Full names that appear in some lines
    'John': 'John', 'Acts': 'Acts', 'Mark': 'Mark', 'Luke': 'Luke',
    'Matthew': 'Matt', 'Titus': 'Titus', 'Philemon': 'Phlm',
    'Hebrews': 'Heb', 'James': 'Jas', 'Jude': 'Jude', 'Revelation': 'Rev',
}

// OT book abbreviations — used to detect Hebrew vs Greek lines in STEPBible
const OT_BOOK_ABBREVS = new Set([
    'Gen', 'Exo', 'Lev', 'Num', 'Deu', 'Jos', 'Jdg', 'Rut',
    '1Sa', '2Sa', '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Neh', 'Est', 'Job', 'Psa',
    'Pro', 'Ecc', 'Sng', 'Isa', 'Jer', 'Lam', 'Eze', 'Dan', 'Hos', 'Joe', 'Amo',
    'Oba', 'Jon', 'Mic', 'Nah', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal',
])

// ── Helpers ───────────────────────────────────────────────────────────────────

function write(filename, data) {
    const fp = path.join(OUTPUT, filename)
    fs.writeFileSync(fp, JSON.stringify(data))
    const kb = (fs.statSync(fp).size / 1024).toFixed(1)
    console.log(`  ✓ ${filename} (${kb} KB)`)
}

function cleanDef(raw) {
    return (raw ?? '')
        .replace(/<[^>]+>/g, '')
        .replace(/¶/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function extractJSON(raw) {
    const first = raw.indexOf('{')
    const last = raw.lastIndexOf('}')
    if (first === -1) throw new Error('No JSON object found')
    return raw.slice(first, last + 1)
}

function normalizeStrongs(raw) {
    const match = (raw ?? '').match(/([GH])0*(\d+)/)
    if (!match) return ''
    return `${match[1]}${match[2]}`
}

function findFile(dir, prefix) {
    const files = fs.readdirSync(dir)
    const found = files.find(f => f.startsWith(prefix))
    if (!found) throw new Error(`No file starting with "${prefix}" in ${dir}`)
    return path.join(dir, found)
}

// ── Generic translation processor ────────────────────────────────────────────
// Handles the scrollmapper JSON format:
// { books: [ { name, chapters: [ { chapter, verses: [ { verse, text } ] } ] } ] }

function processTranslation(filePath) {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const data = {}

    for (const book of raw.books) {
        const bookId = FULL_NAME_TO_ID[book.name]
        if (!bookId) { console.warn(`  skip unknown book: ${book.name}`); continue }

        for (const chapter of book.chapters) {
            for (const verse of chapter.verses) {
                const clean = verse.text
                    .replace(/<[^>]+>/g, '')
                    .replace(/¶/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                data[`${bookId}.${chapter.chapter}.${verse.verse}`] = clean
            }
        }
    }

    return data
}

// ── 1. Bible translations ─────────────────────────────────────────────────────

console.log('\n[1] Bible translations...')

console.log('  KJV...')
const kjv = processTranslation(`${SOURCE}/KJVA.json`)
write('kjv.json', kjv)
console.log(`    ${Object.keys(kjv).length} verses`)

if (fs.existsSync(`${SOURCE}/DRC.json`)) {
    console.log('  DRC...')
    const drc = processTranslation(`${SOURCE}/DRC.json`)
    write('drc.json', drc)
    console.log(`    ${Object.keys(drc).length} verses`)
} else {
    console.warn('  DRC.json not found — skipping')
}

// ── Add more translations here following same pattern ─────────────────────────
// if (fs.existsSync(`${SOURCE}/YLT.json`)) {
//   console.log('  YLT...')
//   const ylt = processTranslation(`${SOURCE}/YLT.json`)
//   write('ylt.json', ylt)
// }

// ── 2. Strong's Greek dictionary ──────────────────────────────────────────────

console.log('\n[2] Strong\'s Greek...')
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

console.log('\n[3] Strong\'s Hebrew...')
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

// ── 4. TAGNT — Greek NT words ─────────────────────────────────────────────────
// STEPBible format — tab-separated:
// ref#word=type  Greek(translit)  English  Strongs=Grammar  lemma=meaning ...
//
// ref format: Mat.1.1#01=NKO
// numbered books: 1Co.1.1 (not 1Cor)

console.log('\n[4] TAGNT Greek NT...')
const gntWords = {}

try {
    const tagntFiles = [
        findFile(STEPBIBLE, 'TAGNT Mat-Jhn'),
        findFile(STEPBIBLE, 'TAGNT Act-Rev'),
    ]

    for (const file of tagntFiles) {
        console.log(`  ${path.basename(file)}`)
        processStepFile(file, gntWords, greekDict, hebrewDict)
    }
    console.log(`  ${Object.keys(gntWords).length} verses`)
} catch (e) {
    console.error(`  TAGNT error: ${e.message}`)
}

write('gnt-words.json', gntWords)

// ── 5. TAHOT — Hebrew OT words ────────────────────────────────────────────────

console.log('\n[5] TAHOT Hebrew OT...')
const otWords = {}

try {
    const tahotFiles = [
        findFile(STEPBIBLE, 'TAHOT Gen-Deu'),
        findFile(STEPBIBLE, 'TAHOT Jos-Est'),
        findFile(STEPBIBLE, 'TAHOT Job-Sng'),
        findFile(STEPBIBLE, 'TAHOT Isa-Mal'),
    ]

    for (const file of tahotFiles) {
        console.log(`  ${path.basename(file)}`)
        processStepFile(file, otWords, greekDict, hebrewDict)
    }
    console.log(`  ${Object.keys(otWords).length} verses`)
} catch (e) {
    console.error(`  TAHOT error: ${e.message}`)
}

write('ot-words.json', otWords)

// ── 6. Chapter index ──────────────────────────────────────────────────────────

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

// ── 7. Books metadata ─────────────────────────────────────────────────────────

write('books.json', BOOKS)

console.log('\n✓ Done.')
console.log('\nOutput files in public/data/:')
console.log('  kjv.json, drc.json        — verse text per translation')
console.log('  strongs-greek.json        — Greek definitions')
console.log('  strongs-hebrew.json       — Hebrew definitions')
console.log('  gnt-words.json            — Greek NT word objects per verse')
console.log('  ot-words.json             — Hebrew OT word objects per verse')
console.log('  chapter-index.json        — chapter → verse ID list')
console.log('  books.json                — book metadata')

// ── STEPBible line processor ──────────────────────────────────────────────────

function processStepFile(filePath, wordsMap, greekDict, hebrewDict) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')

    for (const line of lines) {
        // Data lines start with a book abbreviation (letter or digit+letter)
        if (!line.match(/^[0-9]?[A-Z][a-zA-Z]{1,3}\./)) continue

        const cols = line.split('\t')
        if (cols.length < 4) continue

        const refField = cols[0].trim()
        if (!refField.includes('.')) continue

        // Parse ref: "Mat.1.1#01=NKO" → book, chapter, verse
        const refPart = refField.split('#')[0]
        const parts = refPart.split('.')
        const stepBook = parts[0]
        const bookId = STEP_TO_ID[stepBook]
        if (!bookId) continue

        const chapter = parseInt(parts[1])
        const verse = parseInt(parts[2])
        if (!chapter || !verse) continue

        const verseId = `${bookId}.${chapter}.${verse}`
        if (!wordsMap[verseId]) wordsMap[verseId] = []

        const isHebrew = OT_BOOK_ABBREVS.has(stepBook)

        let surface, transliteration, englishGloss, strongsNumber, morphology

        if (isHebrew) {
            // TAHOT columns:
            // 0:ref  1:Hebrew  2:translit  3:English  4:Strongs(compound)  5:morph  9:mainStrongs
            surface = (cols[1]?.trim() ?? '').replace('/', '').replace(/¶/g, '').trim()
            transliteration = (cols[2]?.trim() ?? '')
                .replace(/\//g, ' ').replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase()
            englishGloss = (cols[3]?.trim() ?? '')
                .replace(/\//g, ' ').replace(/\s+/g, ' ').replace(/[\[\]]/g, '').trim()
            const col9 = cols[9]?.trim() ?? ''
            const col4 = cols[4]?.trim() ?? ''
            if (col9.match(/^H\d+/)) {
                strongsNumber = normalizeStrongs(col9)
            } else {
                const braceMatch = col4.match(/\{H(\d+)/)
                const directMatch = col4.match(/^H(\d+)/)
                strongsNumber = braceMatch
                    ? normalizeStrongs(`H${braceMatch[1]}`)
                    : directMatch ? normalizeStrongs(`H${directMatch[1]}`) : ''
            }
            morphology = cols[5]?.trim() ?? ''

        } else {
            // TAGNT columns:
            // 0:ref  1:Greek(translit)  2:English  3:Strongs=Grammar  4:lemma=meaning
            const wordCol = cols[1]?.trim() ?? ''
            const transitMatch = wordCol.match(/^(.+?)\s*\(([^)]+)\)/)
            surface = ((transitMatch ? transitMatch[1] : wordCol.split(' ')[0]) ?? '')
                .replace(/¶/g, '').trim()
            transliteration = transitMatch ? transitMatch[2].trim() : ''
            englishGloss = (cols[2]?.trim() ?? '').replace(/[\[\]]/g, '').trim()
            const strongsCol = cols[3]?.trim() ?? ''
            const strongsParts = strongsCol.split('=')
            strongsNumber = normalizeStrongs(strongsParts[0] ?? '')
            morphology = strongsParts[1] ?? ''
        }

        if (!surface) continue

        // Enrich with definition from Strong's dictionary
        const dict = isHebrew ? hebrewDict[strongsNumber] : greekDict[strongsNumber]
        const wordIdx = wordsMap[verseId].length + 1

        wordsMap[verseId].push({
            wordId: `${verseId}.${wordIdx}`,
            surface,
            transliteration: transliteration || (dict?.transliteration ?? ''),
            strongsNumber,
            morphology,
            englishGloss: englishGloss || dict?.shortDef || '',
            definition: dict?.definition ?? '',
        })
    }
}
