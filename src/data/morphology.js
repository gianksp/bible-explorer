// morphology.js
// Decodes morphology codes from STEPBible/MorphGNT/OSHB into plain English
//
// Greek format: V-AAI-3S (part-of-speech + tense/voice/mood + person/number)
// Hebrew format: HVqp3ms (H prefix + verb/noun codes)

// ── Greek ─────────────────────────────────────────────────────────────────────

const GREEK_POS = {
    'V': 'Verb',
    'N': 'Noun',
    'A': 'Adjective',
    'P': 'Preposition',
    'RA': 'Definite article',
    'RD': 'Demonstrative pronoun',
    'RI': 'Interrogative pronoun',
    'RP': 'Personal pronoun',
    'RR': 'Relative pronoun',
    'C': 'Conjunction',
    'D': 'Adverb',
    'I': 'Interjection',
    'X': 'Particle',
    'T': 'Article',
}

const GREEK_TENSE = {
    'P': 'present',
    'I': 'imperfect',
    'F': 'future',
    'A': 'aorist',
    'X': 'perfect',
    'Y': 'pluperfect',
}

const GREEK_VOICE = {
    'A': 'active',
    'M': 'middle',
    'P': 'passive',
    'E': 'middle or passive',
    'D': 'deponent',
}

const GREEK_MOOD = {
    'I': 'indicative',
    'D': 'imperative',
    'S': 'subjunctive',
    'O': 'optative',
    'N': 'infinitive',
    'P': 'participle',
}

const GREEK_CASE = {
    'N': 'nominative',
    'G': 'genitive',
    'D': 'dative',
    'A': 'accusative',
    'V': 'vocative',
}

const GREEK_NUMBER = {
    'S': 'singular',
    'P': 'plural',
}

const GREEK_GENDER = {
    'M': 'masculine',
    'F': 'feminine',
    'N': 'neuter',
}

const GREEK_PERSON = {
    '1': '1st person',
    '2': '2nd person',
    '3': '3rd person',
}

function decodeGreek(code) {
    if (!code) return null
    const parts = []

    // Format: POS-PARSING e.g. V-AAI-3S or N-NSM or PREP
    const segments = code.replace(/^H/, '').split('-').filter(Boolean)
    if (!segments.length) return null

    const pos = segments[0]
    const posLabel = GREEK_POS[pos]
    if (posLabel) parts.push(posLabel)

    // Verb parsing: tense + voice + mood + person + number
    if (pos === 'V' && segments[1]) {
        const parsing = segments[1]
        const tense = GREEK_TENSE[parsing[0]]
        const voice = GREEK_VOICE[parsing[1]]
        const mood = GREEK_MOOD[parsing[2]]
        if (tense) parts.push(tense)
        if (voice) parts.push(voice)
        if (mood) parts.push(mood)

        if (segments[2]) {
            const pn = segments[2]
            const person = GREEK_PERSON[pn[0]]
            const number = GREEK_NUMBER[pn[1]]
            if (person) parts.push(person)
            if (number) parts.push(number)
        }
    }

    // Noun/adjective/article parsing: case + number + gender
    if ((pos === 'N' || pos === 'A' || pos === 'RA' || pos === 'T') && segments[1]) {
        const parsing = segments[1]
        const gcase = GREEK_CASE[parsing[0]]
        const number = GREEK_NUMBER[parsing[1]]
        const gender = GREEK_GENDER[parsing[2]]
        if (gcase) parts.push(gcase)
        if (number) parts.push(number)
        if (gender) parts.push(gender)
    }

    // Pronoun parsing: case + number + gender
    if (pos.startsWith('R') && segments[1]) {
        const parsing = segments[1]
        const gcase = GREEK_CASE[parsing[0]]
        const number = GREEK_NUMBER[parsing[1]]
        const gender = GREEK_GENDER[parsing[2]]
        if (gcase) parts.push(gcase)
        if (number) parts.push(number)
        if (gender) parts.push(gender)
    }

    return parts.length ? parts.join(', ') : null
}

// ── Hebrew ────────────────────────────────────────────────────────────────────

const HEBREW_POS = {
    'V': 'Verb',
    'N': 'Noun',
    'A': 'Adjective',
    'P': 'Pronoun',
    'S': 'Suffix',
    'D': 'Adverb',
    'T': 'Particle',
    'R': 'Preposition',
    'C': 'Conjunction',
    'I': 'Interjection',
}

const HEBREW_STEM = {
    'q': 'Qal',
    'N': 'Niphal',
    'p': 'Piel',
    'P': 'Pual',
    'h': 'Hiphil',
    'H': 'Hophal',
    't': 'Hithpael',
    'o': 'Polel',
    'O': 'Polal',
    'r': 'Hithpolel',
    'm': 'Poel',
    'M': 'Poal',
    'k': 'Palel',
    'K': 'Pulal',
    'Q': 'Qal passive',
    'l': 'Pilpel',
    'L': 'Polpal',
    'f': 'Hithpalpel',
    'D': 'Nithpael',
    'j': 'Pealal',
    'i': 'Pilel',
    'u': 'Hithpoel',
    'c': 'Tiphil',
    'v': 'Hishtaphel',
    'w': 'Nithpalel',
    'y': 'Nithpoel',
    'z': 'Hithpalpel',
}

const HEBREW_ASPECT = {
    'p': 'perfect',
    'q': 'sequential perfect',
    'i': 'imperfect',
    'w': 'sequential imperfect',
    'h': 'cohortative',
    'j': 'jussive',
    'v': 'imperative',
    'r': 'participle active',
    's': 'participle passive',
    'a': 'infinitive absolute',
    'c': 'infinitive construct',
}

const HEBREW_PERSON = {
    '1': '1st person',
    '2': '2nd person',
    '3': '3rd person',
}

const HEBREW_GENDER = {
    'm': 'masculine',
    'f': 'feminine',
    'c': 'common gender',
}

const HEBREW_NUMBER = {
    's': 'singular',
    'p': 'plural',
    'd': 'dual',
}

const HEBREW_STATE = {
    'a': 'absolute',
    'c': 'construct',
    'd': 'determined',
}

function decodeHebrew(code) {
    if (!code) return null

    // Strip H prefix and prefix codes (HR/, HC/ etc)
    const clean = code.replace(/^H/, '').replace(/^[A-Z][a-z]?\//, '')
    if (!clean) return null

    const parts = []
    const pos = HEBREW_POS[clean[0]]
    if (pos) parts.push(pos)

    if (clean[0] === 'V') {
        // Verb: stem + aspect + person + gender + number
        const stem = HEBREW_STEM[clean[1]]
        const aspect = HEBREW_ASPECT[clean[2]]
        const person = HEBREW_PERSON[clean[3]]
        const gender = HEBREW_GENDER[clean[4]]
        const number = HEBREW_NUMBER[clean[5]]
        if (stem) parts.push(stem)
        if (aspect) parts.push(aspect)
        if (person) parts.push(person)
        if (gender) parts.push(gender)
        if (number) parts.push(number)
    } else if (clean[0] === 'N' || clean[0] === 'A') {
        // Noun/adjective: gender + number + state
        const gender = HEBREW_GENDER[clean[1]]
        const number = HEBREW_NUMBER[clean[2]]
        const state = HEBREW_STATE[clean[3]]
        if (gender) parts.push(gender)
        if (number) parts.push(number)
        if (state) parts.push(state)
    } else if (clean[0] === 'P') {
        // Pronoun: person + gender + number
        const person = HEBREW_PERSON[clean[1]]
        const gender = HEBREW_GENDER[clean[2]]
        const number = HEBREW_NUMBER[clean[3]]
        if (person) parts.push(person)
        if (gender) parts.push(gender)
        if (number) parts.push(number)
    }

    return parts.length > 1 ? parts.join(', ') : parts[0] ?? null
}

// ── Main export ───────────────────────────────────────────────────────────────

export function decodeMorphology(code, strongsNumber) {
    if (!code) return null
    const isHebrew = strongsNumber?.startsWith('H') || code.startsWith('H')
    const decoded = isHebrew ? decodeHebrew(code) : decodeGreek(code)
    return decoded ?? null
}