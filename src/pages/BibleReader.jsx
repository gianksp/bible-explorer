import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopBar from '../components/header/TopBar.jsx'
import PassageDropdown from '../components/header/PassageDropdown.jsx'
import PassageView from '../components/canvas/PassageView.jsx'
import ChapterNav from '../components/canvas/ChapterNav.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import { usePassage } from '../data/useBibleData.js'
import { CHAPTER_COUNTS } from '../components/header/BookNav.jsx'
import { DEFAULT_VERSION_ID } from '../data/versions.js'

const DEFAULT_BOOK = 'Genesis'
const DEFAULT_CHAPTER = 1

export default function BibleReader() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [selectedBook, setSelectedBook] = useState(searchParams.get('book') ?? DEFAULT_BOOK)
  const [selectedChapter, setSelectedChapter] = useState(parseInt(searchParams.get('chapter') ?? DEFAULT_CHAPTER))
  const [selectedVerse, setSelectedVerse] = useState(parseInt(searchParams.get('verse') ?? '0') || null)
  const [activeVersionIds, setActiveVersionIds] = useState([DEFAULT_VERSION_ID])
  const [showInterlinear, setShowInterlinear] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const book = searchParams.get('book')
    const chapter = searchParams.get('chapter')
    const verse = searchParams.get('verse')
    if (book) setSelectedBook(book)
    if (chapter) setSelectedChapter(parseInt(chapter))
    if (verse) setSelectedVerse(parseInt(verse))
    else setSelectedVerse(null)
  }, [searchParams])

  const { data: verses, isLoading, error } = usePassage({
    book: selectedBook,
    chapter: selectedChapter,
    verseStart: null,
    verseEnd: null,
    activeVersionIds,
  })

  function handleSelectPassage({ book, chapter }) {
    setSelectedBook(book)
    setSelectedChapter(chapter ?? 1)
    setSelectedVerse(null)
  }

  function handleSearch(rawQuery) {
    navigate(`/search?q=${encodeURIComponent(rawQuery)}`)
  }

  function handleToggleVersion(versionId) {
    setActiveVersionIds(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId)
      }
      return [...prev, versionId]
    })
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

  const versionLabel = activeVersionIds.length === 1
    ? activeVersionIds[0]
    : activeVersionIds.join(' · ')

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden relative">
      <TopBar
        label={`${selectedBook} ${selectedChapter}`}
        versionId={versionLabel}
        dropdownOpen={dropdownOpen}
        onToggleDropdown={() => setDropdownOpen(prev => !prev)}
      />

      <PassageDropdown
        isOpen={dropdownOpen}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        activeVersionIds={activeVersionIds}
        showInterlinear={showInterlinear}
        onClose={() => setDropdownOpen(false)}
        onSelectPassage={handleSelectPassage}
        onSearch={handleSearch}
        onToggleVersion={handleToggleVersion}
        onToggleInterlinear={() => setShowInterlinear(prev => !prev)}
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="max-w-2xl mx-auto px-6 py-10"><LoadingState /></div>
        )}
        {error && (
          <div className="max-w-2xl mx-auto px-6 py-10"><ErrorState message={error} /></div>
        )}
        {!isLoading && !error && (
          <PassageView
            verses={verses}
            versionIds={activeVersionIds}
            showInterlinear={showInterlinear}
            highlightVerse={selectedVerse}
          />
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
