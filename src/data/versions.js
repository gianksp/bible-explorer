// versions.js
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all Bible versions.
//
// To add a new English version:
//   1. Add an entry to VERSIONS below
//   2. Add processing in process-bible-data.mjs (one block, ~8 lines)
//   3. Run: node process-bible-data.mjs
//   Done.
//
// To switch to a real API:
//   Change DATA_SOURCE = 'api' in apiClient.js
//   Done.
// ─────────────────────────────────────────────────────────────────────────────

export const VERSIONS = [

    // ── English translations ──────────────────────────────────────────────────
    // Add new English versions here. Each needs a corresponding JSON file
    // in public/data/ with shape: { "Gen.1.1": "verse text", ... }

    {
        versionId: 'KJV',
        label: 'KJV',
        fullName: 'King James Version (1769)',
        language: 'english',
        isOriginal: false,
        dataFile: 'kjv.json',       // public/data/kjv.json
        isDefault: true,             // used as primary for search snippets
    },
    {
        versionId: 'DRC',
        label: 'DRC',
        fullName: 'Douay-Rheims Challoner (1752)',
        language: 'english',
        isOriginal: false,
        dataFile: 'drc.json',
        isDefault: false,
    },

    // ── Original languages ────────────────────────────────────────────────────
    // These are always shown in verse mode — not user-selectable.
    // Each needs a word-level JSON file with shape:
    // { "John.1.1": [ { wordId, surface, transliteration, strongsNumber, ... } ] }

    {
        versionId: 'GNT',
        label: 'GNT',
        fullName: 'Greek New Testament (SBLGNT)',
        language: 'greek',
        isOriginal: true,
        dataFile: 'gnt-words.json',
        testament: 'NT',             // which testament this covers
    },
    {
        versionId: 'WLC',
        label: 'WLC',
        fullName: 'Westminster Leningrad Codex',
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

// The default version — used for search results, snippets, fallbacks
export const DEFAULT_VERSION = VERSIONS.find(v => v.isDefault) ?? VERSIONS[0]
export const DEFAULT_VERSION_ID = DEFAULT_VERSION.versionId

// English translations only (shown in version picker)
export const ENGLISH_VERSIONS = VERSIONS.filter(v => !v.isOriginal)

// Original language versions (shown automatically in verse mode)
export const ORIGINAL_VERSIONS = VERSIONS.filter(v => v.isOriginal)

// Just the IDs of original versions (used throughout apiClient)
export const ORIGINAL_VERSION_IDS = ORIGINAL_VERSIONS.map(v => v.versionId)

// Get the original language version for a given testament
export function getOriginalForTestament(isOT) {
    return ORIGINAL_VERSIONS.find(v => v.testament === (isOT ? 'OT' : 'NT')) ?? null
}
