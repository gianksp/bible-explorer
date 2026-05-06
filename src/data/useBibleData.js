import { useState, useEffect, useCallback } from 'react'
import {
    fetchVersions,
    fetchPassage,
    fetchSearch,
    fetchStrongs,
    fetchStrongsOccurrences,
    fetchDailyReadings,
} from './apiClient.js'
import { getAppData } from './appStore.js'

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

export function useAppData() {
    return useFetch(() => getAppData(), [])
}

export function useVersions() {
    return useFetch(() => fetchVersions(), [])
}

// Accepts either rawQuery or { book, chapter, verseStart, verseEnd }
export function usePassage({ rawQuery, book, chapter, verseStart = null, verseEnd = null, activeVersionIds = [], showInterlinear = false }) {
    const shouldFetch = Boolean(rawQuery?.trim() || (book && chapter))
    return useFetch(
        shouldFetch
            ? () => fetchPassage({ rawQuery, book, chapter, verseStart, verseEnd, activeVersionIds, showInterlinear })
            : null,
        [rawQuery, book, chapter, verseStart, verseEnd, activeVersionIds, showInterlinear]
    )
}

export function useSearch({ rawQuery, activeVersionIds = [], showInterlinear = false }) {
    const shouldFetch = Boolean(rawQuery?.trim())
    return useFetch(
        shouldFetch ? () => fetchSearch({ rawQuery, activeVersionIds, showInterlinear }) : null,
        [rawQuery, activeVersionIds, showInterlinear]
    )
}

export function useStrongs(strongsNumber) {
    return useFetch(
        strongsNumber ? () => fetchStrongs(strongsNumber) : null,
        [strongsNumber]
    )
}

export function useStrongsOccurrences(strongsNumber, activeVersionIds = []) {
    return useFetch(
        strongsNumber ? () => fetchStrongsOccurrences(strongsNumber, activeVersionIds) : null,
        [strongsNumber, activeVersionIds]
    )
}

export function useDailyReadings(activeVersionIds = []) {
    return useFetch(() => fetchDailyReadings(activeVersionIds), [activeVersionIds])
}

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