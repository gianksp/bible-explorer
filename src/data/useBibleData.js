// useBibleData.js
// React hooks wrapping apiClient functions.
// Every hook returns { data, isLoading, error } — consistent contract.
// Components never touch apiClient directly.

import { useState, useEffect, useCallback } from 'react'
import {
    fetchVersions,
    fetchPassage,
    fetchSearch,
    fetchStrongs,
    fetchStrongsOccurrences,
} from './apiClient.js'

// ── Generic fetch hook ────────────────────────────────────────────────────────
// Re-fetches whenever serialized deps change.
// Skips fetch when fetchFn is null.

function useFetch(fetchFn, deps) {
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const serializedDeps = JSON.stringify(deps)

    useEffect(() => {
        if (!fetchFn) return

        let cancelled = false

        async function run() {
            setLoading(true)
            setError(null)
            try {
                const result = await fetchFn()
                if (!cancelled) setData(result)
            } catch (err) {
                if (!cancelled) setError(err.message ?? 'Something went wrong')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        run()
        return () => { cancelled = true }
    }, [serializedDeps])

    return { data, isLoading, error }
}

// ── useVersions ───────────────────────────────────────────────────────────────
// Returns all available Bible versions.
// data shape: [{ versionId, label, language, isOriginal }]

export function useVersions() {
    return useFetch(() => fetchVersions(), [])
}

// ── usePassage ────────────────────────────────────────────────────────────────
// Fetches verses for a passage. Skips if book or chapter missing.
// data shape: [{ verseId, book, chapter, verse, versions }]

export function usePassage({ book, chapter, verseStart = null, verseEnd = null, activeVersionIds = [] }) {
    const shouldFetch = Boolean(book && chapter)
    return useFetch(
        shouldFetch
            ? () => fetchPassage({ book, chapter, verseStart, verseEnd, activeVersionIds })
            : null,
        [book, chapter, verseStart, verseEnd, activeVersionIds]
    )
}

// ── useSearch ─────────────────────────────────────────────────────────────────
// Fetches search results. Skips if rawQuery is empty.
// data shape: [{ verseId, book, chapter, verse, snippet, matchedTerms, versionId }]

export function useSearch({ rawQuery, activeVersionIds = [] }) {
    const shouldFetch = Boolean(rawQuery?.trim())
    return useFetch(
        shouldFetch
            ? () => fetchSearch({ rawQuery, activeVersionIds })
            : null,
        [rawQuery, activeVersionIds]
    )
}

// ── useStrongs ────────────────────────────────────────────────────────────────
// Fetches a Strong's dictionary entry. Skips if strongsNumber is null.
// data shape: { strongsNumber, language, definition, shortDef }

export function useStrongs(strongsNumber) {
    return useFetch(
        strongsNumber ? () => fetchStrongs(strongsNumber) : null,
        [strongsNumber]
    )
}

// ── useStrongsOccurrences ─────────────────────────────────────────────────────
// Fetches all verses containing a Strong's number.
// data shape: same as search results

export function useStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    return useFetch(
        strongsNumber ? () => fetchStrongsOccurrences(strongsNumber, activeVersionIds) : null,
        [strongsNumber, activeVersionIds]
    )
}

// ── useLazyFetch ──────────────────────────────────────────────────────────────
// Manual trigger — for search bar submissions, not automatic fetching.
// Usage:
//   const { data, isLoading, error, execute } = useLazyFetch()
//   execute(() => fetchSearch({ rawQuery, activeVersionIds }))

export function useLazyFetch() {
    const [data, setData] = useState(null)
    const [isLoading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const execute = useCallback(async (fetchFn) => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchFn()
            setData(result)
            return result
        } catch (err) {
            setError(err.message ?? 'Something went wrong')
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    return { data, isLoading, error, execute }
}
