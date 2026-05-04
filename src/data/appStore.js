// appStore.js
// Fetches books + versions from API once and caches in memory.
// Single source of truth for all app-wide data.
// No hardcoded book lists or version configs anywhere else.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

let cache = null

export async function getAppData() {
    if (cache) return cache

    const [booksRes, versionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/books`),
        fetch(`${API_BASE_URL}/versions`),
    ])

    if (!booksRes.ok) throw new Error(`Failed to fetch books: ${booksRes.status}`)
    if (!versionsRes.ok) throw new Error(`Failed to fetch versions: ${versionsRes.status}`)

    const booksData = await booksRes.json()
    const versionsRaw = await versionsRes.json()

    const versions = versionsRaw.map(mapVersion)

    cache = {
        // ── Books ──────────────────────────────────────────────────────────────
        books: booksData.books,
        nameToId: booksData.nameToId,        // { 'Genesis': 'Gen', ... }
        idToName: booksData.idToName,        // { 'Gen': 'Genesis', ... }
        otBookIds: new Set(booksData.otBookIds),
        chapterCounts: Object.fromEntries(booksData.books.map(b => [b.book_id, b.chapters])),
        chapterCountsByName: Object.fromEntries(booksData.books.map(b => [b.name, b.chapters])),

        // ── Versions ───────────────────────────────────────────────────────────
        versions,
        englishVersions: versions.filter(v => !v.isOriginal),
        originalVersions: versions.filter(v => v.isOriginal),
        defaultVersion: versions.find(v => v.isDefault) ?? versions[0],
        versionMap: Object.fromEntries(versions.map(v => [v.versionId, v])),
    }

    return cache
}

// Convenience exports

export async function getBooks() {
    const data = await getAppData()
    return {
        books: data.books,
        nameToId: data.nameToId,
        idToName: data.idToName,
        otBookIds: data.otBookIds,
        chapterCounts: data.chapterCounts,
        chapterCountsByName: data.chapterCountsByName,
    }
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

export async function resolveBookId(nameOrId) {
    const { nameToId, idToName } = await getBooks()
    if (idToName[nameOrId]) return nameOrId
    if (nameToId[nameOrId]) return nameToId[nameOrId]
    const lower = nameOrId.toLowerCase()
    const found = Object.entries(nameToId).find(([name]) => name.toLowerCase() === lower)
    return found?.[1] ?? null
}

// ── Map API version shape → app shape ─────────────────────────────────────────

function mapVersion(v) {
    return {
        versionId: v.version_id,
        label: v.label,
        fullName: v.full_name,
        description: v.description ?? '',
        language: v.language,
        isOriginal: Boolean(v.is_original),
        isDefault: Boolean(v.is_default),
        testament: v.testament ?? null,
    }
}