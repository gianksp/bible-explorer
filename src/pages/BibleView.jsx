import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopBar from '../components/header/TopBar.jsx'
import PassageDropdown from '../components/header/PassageDropdown.jsx'
import PassageView from '../components/canvas/PassageView.jsx'
import ChapterNav from '../components/canvas/ChapterNav.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SectionLabel from '../components/ui/SectionLabel.jsx'
import { usePassage, useSearch, useAppData, useDailyReadings } from '../data/useBibleData.js'
import { useSettings } from '../data/useSettings.js'
import { useState } from 'react'

export default function BibleView() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const { data: appData } = useAppData()
    const defaultVersionId = appData?.defaultVersion?.versionId ?? 'KJV'

    // ── Persisted settings ────────────────────────────────────────────────────
    const {
        activeVersionIds,
        showInterlinear,
        loaded,
        toggleVersion,
        toggleInterlinear,
    } = useSettings(defaultVersionId)

    // ── Route params ──────────────────────────────────────────────────────────
    const rawQuery = searchParams.get('q') ?? ''
    const selectedBook = searchParams.get('book') ?? ''
    const selectedChapter = parseInt(searchParams.get('chapter') ?? '0') || 0
    const selectedVerse = parseInt(searchParams.get('verse') ?? '0') || null

    const isSearch = Boolean(rawQuery)
    const isPassage = Boolean(selectedBook && selectedChapter)
    const isHome = !isSearch && !isPassage

    const ids = activeVersionIds

    // ── Daily readings for home ───────────────────────────────────────────────
    const { data: daily } = useDailyReadings(ids)

    const homeQuery = useMemo(() => {
        if (!isHome || !daily?.suggestions?.length) return ''
        return daily.suggestions.map(s => s.query).join('; ')
    }, [isHome, daily])

    // ── Data fetching ─────────────────────────────────────────────────────────
    const { data: passageVerses, isLoading: passageLoading, error: passageError } = usePassage({
        book: isPassage ? selectedBook : null,
        chapter: isPassage ? selectedChapter : null,
        showInterlinear,
        activeVersionIds: ids,
    })

    // For search + home — if interlinear is on, fetch each group's interlinear separately
    const activeQuery = isSearch ? rawQuery : (isHome ? homeQuery : '')

    const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearch({
        rawQuery: activeQuery,
        activeVersionIds: ids,
        showInterlinear,  // pass through so search can trigger interlinear
    })

    const isLoading = isPassage ? passageLoading : searchLoading
    const error = isPassage ? passageError : searchError

    // ── Result grouping ───────────────────────────────────────────────────────
    const chapterGroups = useMemo(() => {
        if (!searchResults?.length) return []
        const map = new Map()
        for (const result of searchResults) {
            const key = `${result.book}||${result.chapter}`
            if (!map.has(key)) map.set(key, { book: result.book, chapter: result.chapter, verses: [] })
            map.get(key).verses.push(result)
        }
        return [...map.values()]
    }, [searchResults])

    // ── Handlers ──────────────────────────────────────────────────────────────
    function handleSelectPassage({ book, chapter }) {
        navigate(`/?book=${encodeURIComponent(book)}&chapter=${chapter ?? 1}`)
    }

    function handleSearch(q) {
        navigate(`/search?q=${encodeURIComponent(q)}`)
    }

    function handlePrevChapter() {
        navigate(`/?book=${encodeURIComponent(selectedBook)}&chapter=${Math.max(1, selectedChapter - 1)}`)
    }

    function handleNextChapter() {
        const bookMeta = appData?.books?.find(b => b.name === selectedBook)
        const total = bookMeta?.chapters ?? 150
        navigate(`/?book=${encodeURIComponent(selectedBook)}&chapter=${Math.min(total, selectedChapter + 1)}`)
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    const label = isSearch ? rawQuery
        : isPassage ? `${selectedBook} ${selectedChapter}`
            : "Today's Mass"

    const versionLabel = ids.length === 0 ? 'Original'
        : ids.length === 1 ? ids[0]
            : ids.join(' · ')

    if (!loaded) return null  // wait for settings to load from localStorage

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden relative">
            <TopBar
                label={label}
                versionId={versionLabel}
                dropdownOpen={dropdownOpen}
                onToggleDropdown={() => setDropdownOpen(prev => !prev)}
            />

            <PassageDropdown
                isOpen={dropdownOpen}
                selectedBook={selectedBook}
                selectedChapter={selectedChapter}
                activeVersionIds={ids}
                showInterlinear={showInterlinear}
                onClose={() => setDropdownOpen(false)}
                onSelectPassage={handleSelectPassage}
                onSearch={handleSearch}
                onToggleVersion={toggleVersion}
                onToggleInterlinear={toggleInterlinear}
            />

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="max-w-2xl mx-auto px-6 py-10"><LoadingState /></div>
                )}
                {error && (
                    <div className="max-w-2xl mx-auto px-6 py-10"><ErrorState message={error} /></div>
                )}

                {/* ── Search + Home results ── */}
                {!isLoading && !isPassage && !error && (
                    <div className="max-w-2xl mx-auto px-6 py-8">
                        {isHome && !homeQuery && (
                            <div className="py-10 text-center text-sm text-gray-400">
                                Loading today's readings…
                            </div>
                        )}
                        {activeQuery && !searchResults?.length ? (
                            <EmptyState message={`No results for "${activeQuery}"`} />
                        ) : (
                            <>
                                {isHome && daily?.season && (
                                    <div className="mb-4 text-xs text-amber-500 italic">{daily.season}</div>
                                )}
                                {isSearch && (
                                    <SectionLabel
                                        label={`${searchResults?.length ?? 0} result${searchResults?.length !== 1 ? 's' : ''} for "${rawQuery}"`}
                                    />
                                )}
                                <div className="mt-2">
                                    {chapterGroups.map(group => (
                                        <div key={`${group.book}-${group.chapter}`} className="mb-10">
                                            <button
                                                onClick={() => handleSelectPassage({ book: group.book, chapter: group.chapter })}
                                                className="flex items-center gap-1 mb-1 group"
                                            >
                                                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                                    {group.book} {group.chapter}
                                                </span>
                                                <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
                                            </button>
                                            <PassageView
                                                verses={group.verses.map(r => ({
                                                    verseId: r.verseId,
                                                    book: r.book,
                                                    chapter: r.chapter,
                                                    verse: r.verse,
                                                    versions: r.versions ?? { [r.versionId]: { text: r.snippet } },
                                                }))}
                                                versionIds={ids}
                                                showInterlinear={showInterlinear}
                                                highlightTerms={isSearch
                                                    ? [...new Set(group.verses.flatMap(v => v.matchedTerms ?? []))]
                                                    : []}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Passage reader ── */}
                {!isLoading && isPassage && !error && (
                    <>
                        <PassageView
                            verses={passageVerses ?? []}
                            versionIds={ids}
                            showInterlinear={showInterlinear}
                            highlightVerse={selectedVerse}
                        />
                        {passageVerses?.length > 0 && (
                            <div className="flex justify-center pb-10">
                                <ChapterNav
                                    book={selectedBook}
                                    chapter={selectedChapter}
                                    onPrevChapter={handlePrevChapter}
                                    onNextChapter={handleNextChapter}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}