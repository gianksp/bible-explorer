// appStore.js
// Fetches books + versions from API once, caches in memory.
// Single source of truth — no hardcoded book lists anywhere else.

import { bibleApi } from './bibleApi.js'

let cache = null

// book_id from API is lowercase: 'john', '1corinthians'
// We need a display name map for the UI

const BOOK_ID_TO_NAME = {
    genesis: 'Genesis', exodus: 'Exodus', leviticus: 'Leviticus', numbers: 'Numbers',
    deuteronomy: 'Deuteronomy', joshua: 'Joshua', judges: 'Judges', ruth: 'Ruth',
    '1samuel': '1 Samuel', '2samuel': '2 Samuel', '1kings': '1 Kings', '2kings': '2 Kings',
    '1chronicles': '1 Chronicles', '2chronicles': '2 Chronicles', ezra: 'Ezra', nehemiah: 'Nehemiah',
    esther: 'Esther', job: 'Job', psalms: 'Psalms', proverbs: 'Proverbs',
    ecclesiastes: 'Ecclesiastes', 'songofsolomon': 'Song of Solomon', isaiah: 'Isaiah',
    jeremiah: 'Jeremiah', lamentations: 'Lamentations', ezekiel: 'Ezekiel', daniel: 'Daniel',
    hosea: 'Hosea', joel: 'Joel', amos: 'Amos', obadiah: 'Obadiah',
    jonah: 'Jonah', micah: 'Micah', nahum: 'Nahum', habakkuk: 'Habakkuk',
    zephaniah: 'Zephaniah', haggai: 'Haggai', zechariah: 'Zechariah', malachi: 'Malachi',
    matthew: 'Matthew', mark: 'Mark', luke: 'Luke', john: 'John',
    acts: 'Acts', romans: 'Romans', '1corinthians': '1 Corinthians', '2corinthians': '2 Corinthians',
    galatians: 'Galatians', ephesians: 'Ephesians', philippians: 'Philippians', colossians: 'Colossians',
    '1thessalonians': '1 Thessalonians', '2thessalonians': '2 Thessalonians',
    '1timothy': '1 Timothy', '2timothy': '2 Timothy', titus: 'Titus', philemon: 'Philemon',
    hebrews: 'Hebrews', james: 'James', '1peter': '1 Peter', '2peter': '2 Peter',
    '1john': '1 John', '2john': '2 John', '3john': '3 John', jude: 'Jude', revelation: 'Revelation',
    // Apocrypha
    tobit: 'Tobit', judith: 'Judith', '1maccabees': '1 Maccabees', '2maccabees': '2 Maccabees',
    wisdom: 'Wisdom', sirach: 'Sirach', baruch: 'Baruch',
}

const BOOK_NAME_TO_ID = Object.fromEntries(
    Object.entries(BOOK_ID_TO_NAME).map(([id, name]) => [name.toLowerCase(), id])
)

const OT_BOOK_IDS = new Set([
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth',
    '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah',
    'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'songofsolomon', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah',
    'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
    'tobit', 'judith', '1maccabees', '2maccabees', 'wisdom', 'sirach', 'baruch',
])

export async function getAppData() {
    if (cache) return cache

    const biblesRaw = await bibleApi.listBibles()

    const versions = biblesRaw.map(b => ({
        versionId: b.bible_id.toUpperCase(),
        bibleId: b.bible_id,
        label: b.bible_id.toUpperCase(),
        fullName: b.name,
        description: `${b.name} (${b.year})`,
        language: b.lang === 'en' ? 'english' : b.lang,
        isOriginal: false,
        isDefault: b.bible_id === 'kjv',
        testament: null,
    }))

    // Add original language versions
    versions.push({
        versionId: 'GNT', bibleId: 'gnt-interlinear', label: 'GNT',
        fullName: 'Greek New Testament', description: 'Original Greek text with morphology',
        language: 'greek', isOriginal: true, isDefault: false, testament: 'NT',
    })
    versions.push({
        versionId: 'WLC', bibleId: 'wlc-interlinear', label: 'WLC',
        fullName: 'Westminster Leningrad Codex', description: 'Original Hebrew text with morphology',
        language: 'hebrew', isOriginal: true, isDefault: false, testament: 'OT',
    })

    cache = {
        versions,
        englishVersions: versions.filter(v => !v.isOriginal),
        originalVersions: versions.filter(v => v.isOriginal),
        defaultVersion: versions.find(v => v.isDefault) ?? versions[0],
        versionMap: Object.fromEntries(versions.map(v => [v.versionId, v])),
        bibleIdMap: Object.fromEntries(versions.map(v => [v.bibleId, v])),
        // Books
        idToName: BOOK_ID_TO_NAME,
        nameToId: BOOK_NAME_TO_ID,
        otBookIds: OT_BOOK_IDS,
    }

    return cache
}

export async function getVersions() {
    const data = await getAppData()
    return {
        versions: data.versions,
        englishVersions: data.englishVersions,
        originalVersions: data.originalVersions,
        defaultVersion: data.defaultVersion,
        versionMap: data.versionMap,
    }
}

export async function getBooks() {
    const data = await getAppData()
    return {
        idToName: data.idToName,
        nameToId: data.nameToId,
        otBookIds: data.otBookIds,
    }
}

// Resolve any book name/id variant → lowercase API book_id
// e.g. 'John', 'john', 'jn', 'Gospel of John' → 'john'
export async function resolveBookId(nameOrId) {
    const lower = nameOrId.toLowerCase().replace(/\s+/g, '')
    // Direct match
    if (BOOK_ID_TO_NAME[lower]) return lower
    // Name match
    const byName = BOOK_NAME_TO_ID[lower]
    if (byName) return byName
    return null
}