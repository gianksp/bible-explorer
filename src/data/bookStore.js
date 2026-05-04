// bookStore.js
// Fetches book metadata once from the API and caches it in memory.
// All components use this instead of hardcoded maps.
//
// Usage:
//   const { nameToId, idToName, otBookIds, books } = await getBooks()
//   const bookId = nameToId['Romans']  // → 'Rom'
//   const isOT   = otBookIds.has('Gen') // → true

const API_BASE_URL = 'http://localhost:8787'
// const API_BASE_URL = 'https://bible-explorer-api.your-subdomain.workers.dev'

let cache = null

export async function getBooks() {
    if (cache) return cache

    const res = await fetch(`${API_BASE_URL}/books`)
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`)
    const data = await res.json()

    cache = {
        books: data.books,
        nameToId: data.nameToId,
        idToName: data.idToName,
        otBookIds: new Set(data.otBookIds),
        // chapter counts map: { 'Gen': 50, 'John': 21, ... }
        chapterCounts: Object.fromEntries(data.books.map(b => [b.book_id, b.chapters])),
        // full name → chapters: { 'Genesis': 50, ... }
        chapterCountsByName: Object.fromEntries(data.books.map(b => [b.name, b.chapters])),
    }

    return cache
}

// Convenience — resolve book name or ID to book_id
// Accepts: 'Romans', 'Rom', 'rom' → 'Rom'
export async function resolveBookId(nameOrId) {
    const { nameToId, idToName } = await getBooks()
    // Already an ID
    if (idToName[nameOrId]) return nameOrId
    // Full name
    if (nameToId[nameOrId]) return nameToId[nameOrId]
    // Case-insensitive fallback
    const lower = nameOrId.toLowerCase()
    const found = Object.entries(nameToId).find(([name]) => name.toLowerCase() === lower)
    return found?.[1] ?? null
}