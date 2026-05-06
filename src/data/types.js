// src/api/types.js
// JSDoc type definitions matching Bible API OpenAPI schemas

/**
 * @typedef {Object} Bible
 * @property {string} bible_id
 * @property {string} name
 * @property {string} lang
 * @property {string|null} [year]
 */

/**
 * @typedef {Object} Book
 * @property {string} book_id
 * @property {number} chapters
 */

/**
 * @typedef {Object} PassageReference
 * @property {string} bookId
 * @property {number|null} [chapter]
 * @property {number|null} [verseStart]
 * @property {number|null} [verseEnd]
 */

/**
 * @typedef {Object} Verse
 * @property {string} bible_id
 * @property {string} book_id
 * @property {number} chapter
 * @property {number} verse
 * @property {string} text
 */

/**
 * @typedef {Object} VersesResult
 * @property {PassageReference} reference
 * @property {Object.<string, Verse[]>} bibles
 */

/**
 * @typedef {Object} VersesResponse
 * @property {string} query
 * @property {string[]} bibles
 * @property {VersesResult[]} results
 */

/**
 * @typedef {Object} SearchResponse
 * @property {string} query
 * @property {string[]} bibles
 * @property {number} count
 * @property {Verse[]} results
 */

/**
 * @typedef {Object} DailyReading
 * @property {string} title
 * @property {string} reference
 * @property {PassageReference[]} references
 * @property {Object.<string, Verse[]>} bibles
 */

/**
 * @typedef {Object} DailyResponse
 * @property {string} date
 * @property {string[]} bibles
 * @property {string} source
 * @property {DailyReading[]} readings
 */

/**
 * @typedef {Object} InterlinearWord
 * @property {string} word_id
 * @property {number} position
 * @property {string} surface
 * @property {string|null} [transliteration]
 * @property {string|null} [strongs_number]
 * @property {string|null} [morphology]
 * @property {string|null} [english_gloss]
 * @property {string|null} [definition]
 */

/**
 * @typedef {Object} InterlinearVerse
 * @property {string} book_id
 * @property {number} chapter
 * @property {number} verse
 * @property {string} language
 * @property {InterlinearWord[]} words
 */

/**
 * @typedef {Object} InterlinearResult
 * @property {PassageReference} reference
 * @property {InterlinearVerse[]} verses
 */

/**
 * @typedef {Object} InterlinearResponse
 * @property {string} query
 * @property {InterlinearResult[]} results
 */

export {};