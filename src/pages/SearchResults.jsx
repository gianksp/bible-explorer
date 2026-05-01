import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useSearch, usePassage } from '../data/useBibleData.js'
import { DEFAULT_VERSION_ID } from '../data/mockVerses.js'
import TopBar from '../components/nav/TopBar.jsx'
import PassageDropdown from '../components/nav/PassageDropdown.jsx'
import VerseByVerseView from '../components/passage/VerseByVerseView.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SectionLabel from '../components/ui/SectionLabel.jsx'

export default function SearchResults() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const rawQuery = searchParams.get('q') ?? ''

    const [activeVersionId, setActiveVersionId] = useState(DEFAULT_VERSION_ID)
    const [activeMode, setActiveMode] = useState('reader')
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const { data: results, isLoading, error } = useSearch({
        rawQuery,
        activeVersionIds: [activeVersionId],
    })

    function handleSelectPassage({ book, chapter }) {
        navigate(`/?book=${encodeURIComponent(book)}&chapter=${chapter}&mode=${activeMode}`)
    }

    function handleSearch(newQuery) {
        navigate(`/search?q=${encodeURIComponent(newQuery)}`)
    }

    function handleSelectMode(mode) {
        setActiveMode(mode)
    }

    // Group results by book+chapter to fetch whole chapters at once
    const chapterGroups = useMemo(() => {
        if (!results?.length) return []
        const map = {}
        for (const result of results) {
            const key = `${result.book}||${result.chapter}`
            if (!map[key]) map[key] = { book: result.book, chapter: result.chapter, verses: [] }
            map[key].verses.push(result.verse)
        }
        return Object.values(map)
    }, [results])

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden relative">
            <TopBar
                label={rawQuery || 'Search'}
                versionId={activeVersionId}
                activeMode={activeMode}
                onOpenDropdown={() => setDropdownOpen(true)}
                onSelectMode={handleSelectMode}
            />

            <PassageDropdown
                isOpen={dropdownOpen}
                selectedBook={null}
                selectedChapter={null}
                activeVersionId={activeVersionId}
                onClose={() => setDropdownOpen(false)}
                onSelectPassage={handleSelectPassage}
                onSearch={handleSearch}
                onSelectVersion={setActiveVersionId}
            />

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    {isLoading && <LoadingState message="Searching…" />}
                    {error && <ErrorState message={error} />}

                    {!isLoading && results?.length === 0 && (
                        <EmptyState message={`No results found for "${rawQuery}"`} />
                    )}

                    {!isLoading && results && results.length > 0 && (
                        <>
                            <SectionLabel
                                label={`${results.length} result${results.length !== 1 ? 's' : ''} for "${rawQuery}"`}
                            />
                            <div className="mt-2">
                                {chapterGroups.map(group => (
                                    <ChapterResultGroup
                                        key={`${group.book}-${group.chapter}`}
                                        book={group.book}
                                        chapter={group.chapter}
                                        verseNumbers={group.verses}
                                        activeVersionId={activeVersionId}
                                        activeMode={activeMode}
                                        matchedTerms={results
                                            .filter(r => r.book === group.book && r.chapter === group.chapter)
                                            .flatMap(r => r.matchedTerms ?? [])
                                        }
                                        onNavigate={() => navigate(
                                            `/?book=${encodeURIComponent(group.book)}&chapter=${group.chapter}&mode=${activeMode}`
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
import ReaderView from '../components/passage/ReaderView.jsx'

function ChapterResultGroup({
    book,
    chapter,
    verseNumbers,
    activeVersionId,
    activeMode,
    matchedTerms,
    onNavigate,
}) {
    const { data: verses, isLoading } = usePassage({
        book,
        chapter,
        verseStart: null,
        verseEnd: null,
        activeVersionIds: [activeVersionId],
    })

    const matchedVerses = useMemo(() => {
        if (!verses) return []
        return verses.filter(v => verseNumbers.includes(v.verse))
    }, [verses, verseNumbers])

    if (isLoading) return (
        <div className="mb-8">
            <GroupHeader book={book} chapter={chapter} onNavigate={onNavigate} />
            <LoadingState />
        </div>
    )

    if (!matchedVerses.length) return null

    return (
        <div className="mb-10">
            <GroupHeader book={book} chapter={chapter} onNavigate={onNavigate} />
            {activeMode === 'reader'
                ? <ReaderView
                    verses={matchedVerses}
                    versionId={activeVersionId}
                    highlightTerms={matchedTerms}
                />
                : <VerseByVerseView
                    verses={matchedVerses}
                    versionId={activeVersionId}
                    highlightTerms={matchedTerms}
                />
            }
        </div>
    )
}

function GroupHeader({ book, chapter, onNavigate }) {
    return (
        <button
            onClick={onNavigate}
            className="flex items-center gap-1 mb-1 group"
        >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                {book} {chapter}
            </span>
            <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
        </button>
    )
}
