// mockVerses.js
// Used when DATA_SOURCE = 'mock' in apiClient.js
// Matches exact shape that apiClient returns for real data
// MOCK_WORDS must be defined before MOCK_VERSES

export const SECTION_HEADINGS = {
    // 'Gen.1.1': 'The Creation of the World',
    // 'Gen.1.3': 'Light and Darkness',
    // 'Gen.1.6': 'Waters and Sky',
    // 'Gen.1.9': 'Land and Seas',
    // 'Gen.1.14': 'Lights in the Heavens',
    // 'Gen.1.20': 'Creatures of Sea and Sky',
    // 'Gen.1.24': 'Land Animals',
    // 'Gen.1.26': 'Humanity',
    // 'John.1.1': 'The Word Became Flesh',
    // 'John.1.6': 'The Witness of John',
    // 'John.1.14': 'The Word Dwelling Among Us',
}

export const MOCK_WORDS = {
    'Gen.1.1': [
        { wordId: 'Gen.1.1.1', surface: 'בְּרֵאשִׁית', transliteration: 'be reshit', strongsNumber: 'H7225', morphology: 'HR/Ncfsa', englishGloss: 'in beginning', definition: 'the first, in place, time, order or rank (specifically, a firstfruit)' },
        { wordId: 'Gen.1.1.2', surface: 'בָּרָא', transliteration: 'bara', strongsNumber: 'H1254', morphology: 'HVqp3ms', englishGloss: 'he created', definition: 'to create — used exclusively of divine creation' },
        { wordId: 'Gen.1.1.3', surface: 'אֱלֹהִים', transliteration: 'elohim', strongsNumber: 'H430', morphology: 'HNcmpa', englishGloss: 'God', definition: 'God — plural of majesty referring to the one true God' },
        { wordId: 'Gen.1.1.4', surface: 'אֵת', transliteration: 'et', strongsNumber: 'H853', morphology: 'HTo', englishGloss: '—', definition: 'direct object marker — untranslated' },
        { wordId: 'Gen.1.1.5', surface: 'הַשָּׁמַיִם', transliteration: 'hashamayim', strongsNumber: 'H8064', morphology: 'HTd/Ncmpa', englishGloss: 'the heavens', definition: 'heaven, sky — the visible heavens and the abode of God' },
        { wordId: 'Gen.1.1.6', surface: 'וְאֵת', transliteration: 'veet', strongsNumber: 'H853', morphology: 'HC/To', englishGloss: 'and', definition: 'direct object marker with conjunction' },
        { wordId: 'Gen.1.1.7', surface: 'הָאָרֶץ', transliteration: 'haaretz', strongsNumber: 'H776', morphology: 'HTd/Ncbsa', englishGloss: 'the earth', definition: 'earth, land, ground — the physical earth' },
    ],
    'John.1.1': [
        { wordId: 'John.1.1.1', surface: 'Ἐν', transliteration: 'En', strongsNumber: 'G1722', morphology: 'PREP', englishGloss: 'In', definition: 'in, on, at, by — primary preposition denoting position' },
        { wordId: 'John.1.1.2', surface: 'ἀρχῇ', transliteration: 'archē', strongsNumber: 'G746', morphology: 'N-DSF', englishGloss: 'beginning', definition: 'beginning, origin — eternity past' },
        { wordId: 'John.1.1.3', surface: 'ἦν', transliteration: 'ēn', strongsNumber: 'G1510', morphology: 'V-IAI-3S', englishGloss: 'was', definition: 'was — imperfect of eimi, continuous pre-existent existence' },
        { wordId: 'John.1.1.4', surface: 'ὁ', transliteration: 'ho', strongsNumber: 'G3588', morphology: 'T-NSM', englishGloss: 'the', definition: 'the — definite article, masculine nominative singular' },
        { wordId: 'John.1.1.5', surface: 'λόγος', transliteration: 'logos', strongsNumber: 'G3056', morphology: 'N-NSM', englishGloss: 'Word', definition: 'word, speech, divine reason — the pre-existent divine Word' },
        { wordId: 'John.1.1.6', surface: 'καὶ', transliteration: 'kai', strongsNumber: 'G2532', morphology: 'CONJ', englishGloss: 'and', definition: 'and, also, even — coordinating conjunction' },
        { wordId: 'John.1.1.7', surface: 'ὁ', transliteration: 'ho', strongsNumber: 'G3588', morphology: 'T-NSM', englishGloss: 'the', definition: 'the — definite article' },
        { wordId: 'John.1.1.8', surface: 'λόγος', transliteration: 'logos', strongsNumber: 'G3056', morphology: 'N-NSM', englishGloss: 'Word', definition: 'word, speech, divine reason — the pre-existent divine Word' },
        { wordId: 'John.1.1.9', surface: 'ἦν', transliteration: 'ēn', strongsNumber: 'G1510', morphology: 'V-IAI-3S', englishGloss: 'was', definition: 'was — imperfect of eimi' },
        { wordId: 'John.1.1.10', surface: 'πρὸς', transliteration: 'pros', strongsNumber: 'G4314', morphology: 'PREP', englishGloss: 'with', definition: 'to, toward, with — face to face intimate fellowship' },
        { wordId: 'John.1.1.11', surface: 'τὸν', transliteration: 'ton', strongsNumber: 'G3588', morphology: 'T-ASM', englishGloss: 'the', definition: 'the — definite article, masculine accusative singular' },
        { wordId: 'John.1.1.12', surface: 'θεόν', transliteration: 'theon', strongsNumber: 'G2316', morphology: 'N-ASM', englishGloss: 'God', definition: 'God — the supreme divine being' },
        { wordId: 'John.1.1.13', surface: 'καὶ', transliteration: 'kai', strongsNumber: 'G2532', morphology: 'CONJ', englishGloss: 'and', definition: 'and, also, even' },
        { wordId: 'John.1.1.14', surface: 'θεὸς', transliteration: 'theos', strongsNumber: 'G2316', morphology: 'N-NSM', englishGloss: 'God', definition: 'God — applied here to the Word, asserting full deity' },
        { wordId: 'John.1.1.15', surface: 'ἦν', transliteration: 'ēn', strongsNumber: 'G1510', morphology: 'V-IAI-3S', englishGloss: 'was', definition: 'was — imperfect of eimi' },
        { wordId: 'John.1.1.16', surface: 'ὁ', transliteration: 'ho', strongsNumber: 'G3588', morphology: 'T-NSM', englishGloss: 'the', definition: 'the — definite article' },
        { wordId: 'John.1.1.17', surface: 'λόγος', transliteration: 'logos', strongsNumber: 'G3056', morphology: 'N-NSM', englishGloss: 'Word', definition: 'word, speech, divine reason — the pre-existent divine Word' },
    ],
    'John.1.14': [
        { wordId: 'John.1.14.1', surface: 'Καὶ', transliteration: 'Kai', strongsNumber: 'G2532', morphology: 'CONJ', englishGloss: 'And', definition: 'and, also, even' },
        { wordId: 'John.1.14.2', surface: 'ὁ', transliteration: 'ho', strongsNumber: 'G3588', morphology: 'T-NSM', englishGloss: 'the', definition: 'the — definite article' },
        { wordId: 'John.1.14.3', surface: 'λόγος', transliteration: 'logos', strongsNumber: 'G3056', morphology: 'N-NSM', englishGloss: 'Word', definition: 'word, speech, divine reason — the Word becoming incarnate' },
        { wordId: 'John.1.14.4', surface: 'σὰρξ', transliteration: 'sarx', strongsNumber: 'G4561', morphology: 'N-NSF', englishGloss: 'flesh', definition: 'flesh, body, human nature — full human existence' },
        { wordId: 'John.1.14.5', surface: 'ἐγένετο', transliteration: 'egeneto', strongsNumber: 'G1096', morphology: 'V-ADI-3S', englishGloss: 'became', definition: 'to become, come to be — decisive historical change' },
        { wordId: 'John.1.14.6', surface: 'καὶ', transliteration: 'kai', strongsNumber: 'G2532', morphology: 'CONJ', englishGloss: 'and', definition: 'and' },
        { wordId: 'John.1.14.7', surface: 'ἐσκήνωσεν', transliteration: 'eskēnōsen', strongsNumber: 'G4637', morphology: 'V-AAI-3S', englishGloss: 'dwelt', definition: 'to pitch a tent, tabernacle — echoes the Mosaic tabernacle' },
        { wordId: 'John.1.14.8', surface: 'ἐν', transliteration: 'en', strongsNumber: 'G1722', morphology: 'PREP', englishGloss: 'among', definition: 'in, among — presence within the community' },
        { wordId: 'John.1.14.9', surface: 'ἡμῖν', transliteration: 'hēmin', strongsNumber: 'G2254', morphology: 'P-1DP', englishGloss: 'us', definition: 'us — apostolic eyewitnesses' },
    ],
}

export const DEFAULT_VERSION_ID = 'KJV'

export const MOCK_VERSIONS = [
    { versionId: 'KJV', label: 'KJV', language: 'english', isOriginal: false },
    { versionId: 'ESV', label: 'ESV', language: 'english', isOriginal: false },
    { versionId: 'YLT', label: 'YLT', language: 'english', isOriginal: false },
    { versionId: 'NASB', label: 'NASB', language: 'english', isOriginal: false },
    { versionId: 'GNT', label: 'GNT', language: 'greek', isOriginal: true },
    { versionId: 'WLC', label: 'WLC', language: 'hebrew', isOriginal: true },
]

export const MOCK_VERSES = [
    {
        verseId: 'Gen.1.1', book: 'Genesis', chapter: 1, verse: 1,
        versions: {
            KJV: { text: 'In the beginning God created the heaven and the earth.' },
            WLC: { text: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ', words: MOCK_WORDS['Gen.1.1'] },
        },
    },
    {
        verseId: 'Gen.1.2', book: 'Genesis', chapter: 1, verse: 2,
        versions: {
            KJV: { text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
            WLC: { text: 'וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם' },
        },
    },
    {
        verseId: 'Gen.1.3', book: 'Genesis', chapter: 1, verse: 3,
        versions: {
            KJV: { text: 'And God said, Let there be light: and there was light.' },
            WLC: { text: 'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי אוֹר' },
        },
    },
    {
        verseId: 'John.1.1', book: 'John', chapter: 1, verse: 1,
        versions: {
            KJV: { text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
            GNT: { text: 'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.', words: MOCK_WORDS['John.1.1'] },
        },
    },
    {
        verseId: 'John.1.2', book: 'John', chapter: 1, verse: 2,
        versions: {
            KJV: { text: 'The same was in the beginning with God.' },
            GNT: { text: 'οὗτος ἦν ἐν ἀρχῇ πρὸς τὸν θεόν.' },
        },
    },
    {
        verseId: 'John.1.14', book: 'John', chapter: 1, verse: 14,
        versions: {
            KJV: { text: 'And the Word was made flesh, and dwelt among us, and we beheld his glory, the glory as of the only begotten of the Father, full of grace and truth.' },
            GNT: { text: 'Καὶ ὁ λόγος σὰρξ ἐγένετο καὶ ἐσκήνωσεν ἐν ἡμῖν.', words: MOCK_WORDS['John.1.14'] },
        },
    },
    {
        verseId: 'John.3.16', book: 'John', chapter: 3, verse: 16,
        versions: {
            KJV: { text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
            GNT: { text: 'Οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον, ὥστε τὸν υἱὸν τὸν μονογενῆ ἔδωκεν.' },
        },
    },
]

export const MOCK_STRONGS = {
    G3056: { strongsNumber: 'G3056', language: 'greek', definition: 'A word, speech, divine utterance. Used in John\'s prologue for the pre-existent divine Word.', shortDef: 'word' },
    G2316: { strongsNumber: 'G2316', language: 'greek', definition: 'God, the supreme divine being.', shortDef: 'God' },
    H3068: { strongsNumber: 'H3068', language: 'hebrew', definition: 'The personal name of God in the Hebrew scriptures. Rendered LORD in most English translations.', shortDef: 'LORD' },
    H430: { strongsNumber: 'H430', language: 'hebrew', definition: 'God — plural of majesty referring to the one true God.', shortDef: 'God' },
}

export const MOCK_SEARCH_RESULTS = [
    { verseId: 'John.1.1', book: 'John', chapter: 1, verse: 1, snippet: 'In the beginning was the Word...', matchedTerms: ['Word'], versionId: 'KJV' },
    { verseId: 'John.1.14', book: 'John', chapter: 1, verse: 14, snippet: 'And the Word became flesh...', matchedTerms: ['Word'], versionId: 'KJV' },
    { verseId: 'John.3.16', book: 'John', chapter: 3, verse: 16, snippet: 'For God so loved the world...', matchedTerms: ['God'], versionId: 'KJV' },
]
