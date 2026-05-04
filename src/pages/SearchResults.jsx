import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useMemo }            from 'react'
import { useSearch, usePassage }        from '../data/useBibleData.js'
import { DEFAULT_VERSION_ID }           from '../data/versions.js'
import TopBar                           from '../components/header/TopBar.jsx'
import PassageDropdown                  from '../components/header/PassageDropdown.jsx'
import PassageView                      from '../components/passage/PassageView.jsx'
import LoadingState                     from '../components/ui/LoadingState.jsx'
import ErrorState                       from '../components/ui/ErrorState.jsx'
import EmptyState                       from '../components/ui/EmptyState.jsx'
import SectionLabel                     from '../components/ui/SectionLabel.jsx'

export default function SearchResults() {
  const [searchParams]                          = useSearchParams()
  const navigate                                = useNavigate()
  const rawQuery                                = searchParams.get('q') ?? ''

  const [activeVersionIds, setActiveVersionIds] = useState([DEFAULT_VERSION_ID])
  const [showInterlinear,  setShowInterlinear]  = useState(false)
  const [dropdownOpen,     setDropdownOpen]     = useState(false)

  const { data: results, isLoading, error } = useSearch({
    rawQuery,
    activeVersionIds,
  })

  function handleSelectPassage({ book, chapter }) {
    navigate(`/?book=${encodeURIComponent(book)}&chapter=${chapter}`)
  }

  function handleSearch(newQuery) {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`)
  }

  function handleToggleVersion(versionId) {
    setActiveVersionIds(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    )
  }

  const chapterGroups = useMemo(() => {
    if (!results?.length) return []
    const map = {}
    for (const result of results) {
      const key = `${result.book}||${result.chapter}`
      if (!map[key]) map[key] = { book: result.book, chapter: result.chapter, verses: [] }
      map[key].verses.push(parseInt(result.verse))
    }
    return Object.values(map)
  }, [results])

  const versionLabel = activeVersionIds.length === 1
    ? activeVersionIds[0]
    : activeVersionIds.length === 0
      ? 'Original'
      : activeVersionIds.join(' · ')

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden relative">
      <TopBar
        label={rawQuery || 'Search'}
        versionId={versionLabel}
        dropdownOpen={dropdownOpen}
        onToggleDropdown={() => setDropdownOpen(prev => !prev)}
      />

      <PassageDropdown
        isOpen={dropdownOpen}
        selectedBook={null}
        selectedChapter={null}
        activeVersionIds={activeVersionIds}
        showInterlinear={showInterlinear}
        onClose={() => setDropdownOpen(false)}
        onSelectPassage={handleSelectPassage}
        onSearch={handleSearch}
        onToggleVersion={handleToggleVersion}
        onToggleInterlinear={() => setShowInterlinear(prev => !prev)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {isLoading && <LoadingState message="Searching…" />}
          {error     && <ErrorState message={error} />}

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
                    activeVersionIds={activeVersionIds}
                    showInterlinear={showInterlinear}
                    matchedTerms={results
                      .filter(r => r.book === group.book && r.chapter === group.chapter)
                      .flatMap(r => r.matchedTerms ?? [])
                    }
                    onNavigate={() => navigate(
                      `/?book=${encodeURIComponent(group.book)}&chapter=${group.chapter}`
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

function ChapterResultGroup({
  book, chapter, verseNumbers,
  activeVersionIds, showInterlinear,
  matchedTerms, onNavigate,
}) {
  const { data: verses, isLoading } = usePassage({
    book, chapter,
    verseStart: null, verseEnd: null,
    activeVersionIds,
  })

  const matchedVerses = useMemo(() => {
    if (!verses) return []
    return verses.filter(v => verseNumbers.includes(parseInt(v.verse)))
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
      <PassageView
        verses={matchedVerses}
        versionIds={activeVersionIds}
        showInterlinear={showInterlinear}
        highlightTerms={matchedTerms}
      />
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
