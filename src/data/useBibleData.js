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
    fetchDailyReadings,
} from './apiClient.js'

// ── Generic fetch hook ────────────────────────────────────────────────────────

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

export function useVersions() {
    return useFetch(() => fetchVersions(), [])
}

// ── usePassage ────────────────────────────────────────────────────────────────

export function usePassage({ book, chapter, verseStart = null, verseEnd = null, activeVersionIds = [] }) {
    const shouldFetch = Boolean(book && chapter)
    return useFetch(
        shouldFetch ? () => fetchPassage({ book, chapter, verseStart, verseEnd, activeVersionIds }) : null,
        [book, chapter, verseStart, verseEnd, activeVersionIds]
    )
}

// ── useSearch ─────────────────────────────────────────────────────────────────

export function useSearch({ rawQuery, activeVersionIds = [] }) {
    const shouldFetch = Boolean(rawQuery?.trim())
    return useFetch(
        shouldFetch ? () => fetchSearch({ rawQuery, activeVersionIds }) : null,
        [rawQuery, activeVersionIds]
    )
}

// ── useStrongs ────────────────────────────────────────────────────────────────

export function useStrongs(strongsNumber) {
    return useFetch(
        strongsNumber ? () => fetchStrongs(strongsNumber) : null,
        [strongsNumber]
    )
}

// ── useStrongsOccurrences ─────────────────────────────────────────────────────

export function useStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    return useFetch(
        strongsNumber ? () => fetchStrongsOccurrences(strongsNumber, activeVersionIds) : null,
        [strongsNumber, activeVersionIds]
    )
}

// ── useDailyReadings ──────────────────────────────────────────────────────────
// Fetches today's Catholic Mass readings.
// data shape: { season, celebration, suggestions: [ { label, query, type, group } ] }

export function useDailyReadings() {
    return useFetch(() => fetchDailyReadings(), [])
}

// ── useLazyFetch ──────────────────────────────────────────────────────────────

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