// src/api/bibleApi.js
// Auto-generated SDK from Bible API OpenAPI spec

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL;

function buildUrl(base, path, params = {}) {
    const url = new URL(path, base || window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    return url.toString();
}

async function request(baseUrl, path, params = {}) {
    const url = buildUrl(baseUrl, path, params);
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw Object.assign(new Error(json.error ?? res.statusText), { status: res.status, data: json });
    return json;
}

/**
 * @param {string} [baseUrl] - API base URL. Defaults to current host.
 */
export function createBibleApi(baseUrl = DEFAULT_BASE_URL) {
    return {
        /**
         * List all supported Bible versions.
         * @returns {Promise<Array<{ bible_id: string, name: string, lang: string, year?: string }>>}
         */
        listBibles() {
            return request(baseUrl, '/bibles');
        },

        /**
         * List books for a Bible version.
         * @param {string} bible - Bible ID e.g. 'kjv'
         * @returns {Promise<Array<{ book_id: string, chapters: number }>>}
         */
        listBooks(bible) {
            return request(baseUrl, '/books', { bible });
        },

        /**
         * Resolve Bible references to verses.
         * @param {string} q - Reference query e.g. 'john 3:16-18; gen 1:1'
         * @param {string} [bibles='all'] - Comma-separated Bible IDs or 'all'
         * @returns {Promise<import('./types').VersesResponse>}
         */
        getVerses(q, bibles = 'all') {
            return request(baseUrl, '/verses', { q, bibles });
        },

        /**
         * Full-text search across Bible versions.
         * @param {string} q - Keyword or quoted phrase e.g. '"sons of god"'
         * @param {string} [bibles='all'] - Comma-separated Bible IDs or 'all'
         * @returns {Promise<import('./types').SearchResponse>}
         */
        searchVerses(q, bibles = 'all') {
            return request(baseUrl, '/search', { q, bibles });
        },

        /**
         * Get Catholic daily Mass readings.
         * @param {string} [bibles='kjv'] - Comma-separated Bible IDs
         * @param {string} [date] - Date in YYYY-MM-DD format. Defaults to today.
         * @returns {Promise<import('./types').DailyResponse>}
         */
        getDailyReadings(bibles = 'kjv', date) {
            return request(baseUrl, '/daily', { bibles, date });
        },

        /**
         * Get interlinear word data for a reference.
         * @param {string} q - Reference query e.g. 'john 1:1-3; gen 1:1'
         * @returns {Promise<import('./types').InterlinearResponse>}
         */
        getInterlinear(q) {
            return request(baseUrl, '/interlinear', { q });
        },
    };
}

// Default singleton — configure once, use everywhere
export const bibleApi = createBibleApi();