import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopBar from '../components/nav/TopBar.jsx'
import PassageDropdown from '../components/nav/PassageDropdown.jsx'
import ReaderView from '../components/passage/ReaderView.jsx'
import VerseByVerseView from '../components/passage/VerseByVerseView.jsx'
import ChapterNav from '../components/passage/ChapterNav.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import { usePassage } from '../data/useBibleData.js'
import { CHAPTER_COUNTS } from '../components/BookNav.jsx'
import { DEFAULT_VERSION_ID } from '../data/versions.js'

const DEFAULT_BOOK = 'Genesis'
const DEFAULT_CHAPTER = 1
const DEFAULT_MODE = 'reader'

export default function BibleReader() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // ── State ──────────────────────────────────────────────────────────────────
    const [selectedBook, setSelectedBook] = useState(
        searchParams.get('book') ?? DEFAULT_BOOK
    )
    const [selectedChapter, setSelectedChapter] = useState(
        parseInt(searchParams.get('chapter') ?? DEFAULT_CHAPTER)
    )
    const [selectedVerse, setSelectedVerse] = useState(
        parseInt(searchParams.get('verse') ?? '0') || null
    )
    const [activeVersionId, setActiveVersionId] = useState(DEFAULT_VERSION_ID)
    const [activeMode, setActiveMode] = useState(
        searchParams.get('mode') ?? DEFAULT_MODE
    )
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // Sync URL params when navigating from search results
    useEffect(() => {
        const book = searchParams.get('book')
        const chapter = searchParams.get('chapter')
        const verse = searchParams.get('verse')
        const mode = searchParams.get('mode')
        if (book) setSelectedBook(book)
        if (chapter) setSelectedChapter(parseInt(chapter))
        if (verse) setSelectedVerse(parseInt(verse))
        else setSelectedVerse(null)
        if (mode) setActiveMode(mode)
    }, [searchParams])

    // ── Data ───────────────────────────────────────────────────────────────────
    const { data: verses, isLoading, error } = usePassage({
        book: selectedBook,
        chapter: selectedChapter,
        verseStart: null,
        verseEnd: null,
        activeVersionIds: [activeVersionId],
    })

    // ── Handlers ───────────────────────────────────────────────────────────────
    function handleSelectPassage({ book, chapter }) {
        setSelectedBook(book)
        setSelectedChapter(chapter ?? 1)
        setSelectedVerse(null)
    }

    function handleSearch(rawQuery) {
        navigate(`/search?q=${encodeURIComponent(rawQuery)}`)
    }

    function handlePrevChapter() {
        setSelectedChapter(prev => Math.max(1, prev - 1))
        setSelectedVerse(null)
    }

    function handleNextChapter() {
        const total = CHAPTER_COUNTS[selectedBook] ?? 1
        setSelectedChapter(prev => Math.min(total, prev + 1))
        setSelectedVerse(null)
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden relative">
            <TopBar
                label={`${selectedBook} ${selectedChapter}`}
                versionId={activeVersionId}
                activeMode={activeMode}
                onOpenDropdown={() => setDropdownOpen(true)}
                onSelectMode={setActiveMode}
            />

            <PassageDropdown
                isOpen={dropdownOpen}
                selectedBook={selectedBook}
                selectedChapter={selectedChapter}
                activeVersionId={activeVersionId}
                onClose={() => setDropdownOpen(false)}
                onSelectPassage={handleSelectPassage}
                onSearch={handleSearch}
                onSelectVersion={setActiveVersionId}
            />

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="max-w-2xl mx-auto px-6 py-10">
                        <LoadingState />
                    </div>
                )}
                {error && (
                    <div className="max-w-2xl mx-auto px-6 py-10">
                        <ErrorState message={error} />
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {activeMode === 'reader' && (
                            <ReaderView
                                verses={verses}
                                versionId={activeVersionId}
                            />
                        )}
                        {activeMode === 'verse' && (
                            <VerseByVerseView
                                verses={verses}
                                versionId={activeVersionId}
                                highlightVerse={selectedVerse}
                            />
                        )}
                    </>
                )}

                {!isLoading && verses?.length > 0 && (
                    <div className="flex justify-center pb-10">
                        <ChapterNav
                            book={selectedBook}
                            chapter={selectedChapter}
                            onPrevChapter={handlePrevChapter}
                            onNextChapter={handleNextChapter}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
