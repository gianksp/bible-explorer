// useSettings.js
// Persists user preferences to localStorage.
// Single source of truth for activeVersionIds and showInterlinear.

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'bible-explorer-settings'

function loadSettings(defaultVersionId) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
    } catch {
        return null
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch { }
}

export function useSettings(defaultVersionId) {
    const [activeVersionIds, setActiveVersionIdsRaw] = useState(null)
    const [showInterlinear, setShowInterlinearRaw] = useState(false)
    const [loaded, setLoaded] = useState(false)

    // Load from localStorage once defaultVersionId is known
    useEffect(() => {
        if (!defaultVersionId || loaded) return
        const saved = loadSettings()
        if (saved) {
            setActiveVersionIdsRaw(saved.activeVersionIds ?? [defaultVersionId])
            setShowInterlinearRaw(saved.showInterlinear ?? false)
        } else {
            setActiveVersionIdsRaw([defaultVersionId])
        }
        setLoaded(true)
    }, [defaultVersionId, loaded])

    function setActiveVersionIds(updater) {
        setActiveVersionIdsRaw(prev => {
            const next = typeof updater === 'function' ? updater(prev ?? []) : updater
            saveSettings({ activeVersionIds: next, showInterlinear })
            return next
        })
    }

    function setShowInterlinear(value) {
        setShowInterlinearRaw(value)
        saveSettings({ activeVersionIds: activeVersionIds ?? [], showInterlinear: value })
    }

    function toggleVersion(versionId) {
        setActiveVersionIds(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    function toggleInterlinear() {
        setShowInterlinear(!showInterlinear)
    }

    return {
        activeVersionIds: activeVersionIds ?? (defaultVersionId ? [defaultVersionId] : []),
        showInterlinear,
        loaded,
        toggleVersion,
        toggleInterlinear,
    }
}