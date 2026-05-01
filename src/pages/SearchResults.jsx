import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { parseSearch } from '../data/searchParser.js'
import { useSearch } from '../data/useBibleData.js'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SectionLabel from '../components/ui/SectionLabel.jsx'
import VerseReference from '../components/ui/VerseReference.jsx'

export default function SearchResults() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const rawQuery = searchParams.get('q') ?? ''

    const { data: results, isLoading, error } = useSearch({
        rawQuery,
        activeVersionIds: ['KJV'],
    })

    function handleSelectVerse({ book, chapter, verse }) {
        navigate(`/?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`)
    }

    function handleSearch(newQuery) {
        navigate(`/search?q=${encodeURIComponent(newQuery)}`)
    }

    // Group results by book
    const resultsByBook = (results ?? []).reduce((acc, result) => {
        if (!acc[result.book]) acc[result.book] = []
        acc[result.book].push(result)
        return acc
    }, {})

    const parsedQuery = parseSearch(rawQuery)
    const queryLabel = rawQuery ? `"${rawQuery}"` : ''

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Minimal top bar with back button + query */}
            <header className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 shrink-0">
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
                >
                    ← Back
                </button>
                <span className="text-sm text-gray-500 truncate">
                    {queryLabel}
                </span>
            </header>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
                {isLoading && <LoadingState message="Searching…" />}
                {error && <ErrorState message={error} />}

                {!isLoading && results?.length === 0 && (
                    <EmptyState message={`No results found for ${queryLabel}`} />
                )}

                {!isLoading && results && results.length > 0 && (
                    <>
                        <SectionLabel label={`${results.length} result${results.length !== 1 ? 's' : ''}`} />
                        {Object.entries(resultsByBook).map(([book, bookResults]) => (
                            <BookResultGroup
                                key={book}
                                book={book}
                                results={bookResults}
                                onSelectVerse={handleSelectVerse}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

function BookResultGroup({ book, results, onSelectVerse }) {
    return (
        <div className="mb-8">
            <SectionLabel label={`${book} · ${results.length} verse${results.length !== 1 ? 's' : ''}`} />
            <div className="divide-y divide-gray-100">
                {results.map(result => (
                    <SearchResultItem
                        key={result.verseId}
                        result={result}
                        onSelectVerse={onSelectVerse}
                    />
                ))}
            </div>
        </div>
    )
}

function SearchResultItem({ result, onSelectVerse }) {
    const { book, chapter, verse, snippet, matchedTerms, versionId } = result

    return (
        <div className="py-3">
            <div className="flex items-center gap-2 mb-1">
                <VerseReference
                    book={book}
                    chapter={chapter}
                    verse={verse}
                    onClick={() => onSelectVerse({ book, chapter, verse })}
                />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {versionId}
                </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
                {highlightSnippet(snippet, matchedTerms)}
            </p>
        </div>
    )
}

function highlightSnippet(snippet, matchedTerms) {
    if (!matchedTerms?.length || !snippet) return snippet

    const escapedTerms = matchedTerms.map(t =>
        t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = snippet.split(pattern)

    return parts.map((part, i) => {
        const isMatch = matchedTerms.some(t => part.toLowerCase() === t.toLowerCase())
        return isMatch
            ? <mark key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded-sm">{part}</mark>
            : part
    })
}
