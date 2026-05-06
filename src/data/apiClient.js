// apiClient.js
// Thin client — all query parsing and routing is done by the API.
// Just pass raw queries through and map responses to app shapes.

import { bibleApi } from './bibleApi.js'
import { getVersions, getBooks } from './appStore.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function bookIdToName(bookId, idToName) {
    return idToName?.[bookId] ?? bookId
}

function mapVerseResults(results, idToName, defaultVersionId, interlinearByVerse = {}, originalVersions = []) {
    const verseMap = {}

    for (const v of results) {
        const verseId = `${v.book_id}.${v.chapter}.${v.verse}`
        if (!verseMap[verseId]) {
            verseMap[verseId] = {
                verseId,
                book: bookIdToName(v.book_id, idToName),
                chapter: v.chapter,
                verse: v.verse,
                snippet: v.text ?? '',
                versionId: (v.bible_id ?? defaultVersionId).toUpperCase(),
                versions: {},
            }
        }
        const vid = (v.bible_id ?? defaultVersionId).toUpperCase()
        verseMap[verseId].versions[vid] = { text: v.text ?? '' }
        if (!verseMap[verseId].snippet) verseMap[verseId].snippet = v.text ?? ''
    }

    // Attach interlinear words when present
    for (const [verseId, entry] of Object.entries(interlinearByVerse)) {
        if (!verseMap[verseId]) continue
        const isOT = /^(gen|exo|lev|num|deu|jos|jdg|rut|[12]sa|[12]ki|[12]ch|ezr|neh|est|job|psa|pro|ecc|sng|isa|jer|lam|eze|dan|hos|joe|amo|oba|jon|mic|nah|hab|zep|hag|zec|mal)/i.test(verseId)
        const origV = originalVersions.find(o => o.testament === (isOT ? 'OT' : 'NT'))
        if (!origV) continue
        const mappedWords = (entry.words ?? []).map(w => ({
            wordId: w.word_id,
            surface: w.surface,
            transliteration: w.transliteration,
            strongsNumber: w.strongs_number,
            morphology: w.morphology,
            englishGloss: w.english_gloss,
            definition: w.definition,
        }))
        verseMap[verseId].versions[origV.versionId] = {
            text: mappedWords.map(w => w.surface).join(' '),
            words: mappedWords,
        }
    }

    return Object.values(verseMap)
}

function getBibles(activeVersionIds, originalIds, defaultBibleId) {
    return activeVersionIds
        .filter(id => !originalIds.has(id))
        .map(id => id.toLowerCase())
        .join(',') || defaultBibleId
}

// ── Versions ──────────────────────────────────────────────────────────────────

export async function fetchVersions() {
    const { versions } = await getVersions()
    return versions
}

// ── Unified Query ─────────────────────────────────────────────────────────────

export async function fetchQuery({
    rawQuery,
    activeVersionIds = [],
    showInterlinear = false,
}) {
    if (!rawQuery?.trim()) return []

    const { idToName } = await getBooks()
    const { defaultVersion, originalVersions } = await getVersions()

    const originalIds = new Set(originalVersions.map(v => v.versionId))
    const bibles = getBibles(activeVersionIds, originalIds, defaultVersion.bibleId)

    const data = await bibleApi.query(rawQuery, bibles, showInterlinear)

    return mapVerseResults(
        data?.results ?? [],
        idToName,
        defaultVersion.versionId,
        data?.interlinear ?? {},
        originalVersions,
    )
}

// ── Legacy exports ────────────────────────────────────────────────────────────

export async function fetchPassage({ rawQuery, book, chapter, verseStart, verseEnd, activeVersionIds, showInterlinear }) {
    let ref = rawQuery
    if (!ref && book && chapter) {
        ref = `${book} ${chapter}`
        if (verseStart && verseEnd) ref += `:${verseStart}-${verseEnd}`
        else if (verseStart) ref += `:${verseStart}`
    }
    return fetchQuery({ rawQuery: ref, activeVersionIds, showInterlinear })
}

export async function fetchSearch({ rawQuery, activeVersionIds, showInterlinear }) {
    return fetchQuery({ rawQuery, activeVersionIds, showInterlinear })
}

// ── Daily Readings ────────────────────────────────────────────────────────────

export async function fetchDailyReadings(activeVersionIds = []) {
    const { defaultVersion, originalVersions } = await getVersions()
    const { idToName } = await getBooks()

    const originalIds = new Set(originalVersions.map(v => v.versionId))
    const bibles = activeVersionIds
        .filter(id => !originalIds.has(id))
        .map(id => id.toLowerCase())
        .join(',') || defaultVersion.bibleId

    const data = await bibleApi.getDailyReadings(bibles)

    const suggestions = (data.readings ?? []).map(reading => {
        const verseMap = {}
        Object.entries(reading.bibles ?? {}).forEach(([bibleId, verses]) => {
            for (const v of verses) {
                const verseId = `${v.book_id}.${v.chapter}.${v.verse}`
                if (!verseMap[verseId]) {
                    verseMap[verseId] = {
                        verseId,
                        book: bookIdToName(v.book_id, idToName),
                        chapter: v.chapter,
                        verse: v.verse,
                        versions: {},
                    }
                }
                verseMap[verseId].versions[bibleId.toUpperCase()] = { text: v.text }
            }
        })

        return {
            label: `${reading.title} · ${reading.reference}`,
            query: reading.reference,
            type: 'daily',
            group: "Today's Mass",
            title: reading.title,
            reference: reading.reference,
            verses: Object.values(verseMap),
        }
    })

    return {
        season: data.season ?? '',
        celebration: data.celebration ?? null,
        suggestions,
    }
}

// ── Strong's ──────────────────────────────────────────────────────────────────

export async function fetchStrongs(strongsNumber) {
    if (!strongsNumber) return null
    return {
        strongsNumber,
        language: strongsNumber.startsWith('G') ? 'greek' : 'hebrew',
        definition: null,
        shortDef: null,
    }
}

export async function fetchStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    if (!strongsNumber) return []
    return fetchQuery({
        rawQuery: strongsNumber,
        activeVersionIds: activeVersionIds.length ? activeVersionIds : ['KJV'],
    })
}