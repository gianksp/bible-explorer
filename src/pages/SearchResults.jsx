import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useSearch } from '../data/useBibleData.js'
import { DEFAULT_VERSION_ID } from '../data/versions.js'
import TopBar from '../components/header/TopBar.jsx'
import PassageDropdown from '../components/header/PassageDropdown.jsx'
import PassageView from '../components/canvas/PassageView.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import SectionLabel from '../components/ui/SectionLabel.jsx'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const rawQuery = searchParams.get('q') ?? ''

  const [activeVersionIds, setActiveVersionIds] = useState([DEFAULT_VERSION_ID])
  const [showInterlinear, setShowInterlinear] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

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

  // Group results by book+chapter — preserve API order (canonical)
  const chapterGroups = useMemo(() => {
    if (!results?.length) return []
    const map = new Map()
    for (const result of results) {
      const key = `${result.book}||${result.chapter}`
      if (!map.has(key)) map.set(key, {
        book: result.book,
        chapter: result.chapter,
        verses: [],
      })
      map.get(key).verses.push(result)
    }
    return [...map.values()]
  }, [results])

  const versionLabel = activeVersionIds.length === 1
    ? activeVersionIds[0]
    : activeVersionIds.length === 0 ? 'Original'
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
          {error && <ErrorState message={error} />}

          {!isLoading && results?.length === 0 && (
            <EmptyState message={`No results found for "${rawQuery}"`} />
          )}

          {!isLoading && results?.length > 0 && (
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
                    verses={group.verses}
                    showInterlinear={showInterlinear}
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

// Build verse objects from search result snippets — no extra API calls needed
function buildVerseObjects(verses) {
  return verses.map(r => ({
    verseId: r.verseId,
    book: r.book,
    chapter: r.chapter,
    verse: r.verse,
    // Use pre-built versions if available, otherwise build from snippet
    versions: r.versions ?? {
      [r.versionId]: { text: r.snippet },
    },
  }))
}

function ChapterResultGroup({ book, chapter, verses, showInterlinear, onNavigate }) {
  const verseObjects = useMemo(() => buildVerseObjects(verses), [verses])
  const matchedTerms = useMemo(() =>
    [...new Set(verses.flatMap(v => v.matchedTerms ?? []))],
    [verses]
  )
  const primaryVersion = verses[0]?.versionId ?? 'KJV'

  return (
    <div className="mb-10">
      <button
        onClick={onNavigate}
        className="flex items-center gap-1 mb-1 group"
      >
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
          {book} {chapter}
        </span>
        <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
      </button>

      <PassageView
        verses={verseObjects}
        versionIds={[primaryVersion]}
        showInterlinear={showInterlinear}
        highlightTerms={matchedTerms}
      />
    </div>
  )
}