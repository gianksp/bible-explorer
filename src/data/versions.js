// versions.js — single source of truth for all Bible versions
//
// To add a new version:
//   1. Add an entry to VERSIONS below
//   2. Process/download the data file into public/data/
//   Done — nothing else to change.

export const VERSIONS = [

    // ── English translations ──────────────────────────────────────────────────

    {
        versionId: 'KJV',
        label: 'KJV',
        fullName: 'King James Version (1769)',
        description: 'The most widely read English Bible. Celebrated for its majestic prose and poetic rhythm. The standard reference for most English-language theology, commentaries, and apologetics.',
        language: 'english',
        isOriginal: false,
        dataFile: 'kjv.json',
        isDefault: true,
    },
    {
        versionId: 'DRC',
        label: 'DRC',
        fullName: 'Douay-Rheims Challoner (1752)',
        description: 'The traditional Catholic English Bible, translated directly from the Latin Vulgate. Preferred by Catholics for its fidelity to the Vulgate text and inclusion of the deuterocanonical books (Apocrypha).',
        language: 'english',
        isOriginal: false,
        dataFile: 'drc.json',
        isDefault: false,
    },

    // ── Original languages ────────────────────────────────────────────────────
    // Always shown in interlinear mode — not user-selectable as a translation.

    {
        versionId: 'GNT',
        label: 'GNT',
        fullName: 'Greek New Testament (SBLGNT)',
        description: 'The Society of Biblical Literature Greek New Testament — a critical edition of the original Greek text of the New Testament, used by scholars worldwide.',
        language: 'greek',
        isOriginal: true,
        dataFile: 'gnt-words.json',
        testament: 'NT',
    },
    {
        versionId: 'WLC',
        label: 'WLC',
        fullName: 'Westminster Leningrad Codex',
        description: 'The oldest complete manuscript of the Hebrew Bible (1008 AD), the standard text used in all modern Old Testament scholarship and translation.',
        language: 'hebrew',
        isOriginal: true,
        dataFile: 'ot-words.json',
        testament: 'OT',
    },

]

// ── Derived constants — do not edit ──────────────────────────────────────────

export const VERSION_MAP = Object.fromEntries(
    VERSIONS.map(v => [v.versionId, v])
)

export const DEFAULT_VERSION = VERSIONS.find(v => v.isDefault) ?? VERSIONS[0]
export const DEFAULT_VERSION_ID = DEFAULT_VERSION.versionId

export const ENGLISH_VERSIONS = VERSIONS.filter(v => !v.isOriginal)
export const ORIGINAL_VERSIONS = VERSIONS.filter(v => v.isOriginal)
export const ORIGINAL_VERSION_IDS = ORIGINAL_VERSIONS.map(v => v.versionId)

export function getOriginalForTestament(isOT) {
    return ORIGINAL_VERSIONS.find(v => v.testament === (isOT ? 'OT' : 'NT')) ?? null
}