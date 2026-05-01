import { useState, useEffect, useRef } from 'react'
import SearchInput from './SearchInput.jsx'
import AutocompleteList from './AutocompleteList.jsx'
import BookGrid from './BookGrid.jsx'
import ChapterGrid from './ChapterGrid.jsx'
import VersionSelector from './VersionSelector.jsx'
import { parseSearch } from '../../data/searchParser.js'

// Props:
//   isOpen          — bool
//   selectedBook    — string
//   selectedChapter — number
//   activeVersionId — string
//   onClose         — fn()
//   onSelectPassage — fn({ book, chapter })
//   onSearch        — fn(rawQuery)
//   onSelectVersion — fn(versionId)

export default function PassageDropdown({
    isOpen,
    selectedBook,
    selectedChapter,
    activeVersionId,
    onClose,
    onSelectPassage,
    onSearch,
    onSelectVersion,
}) {
    const [query, setQuery] = useState('')
    const [navBook, setNavBook] = useState(null)
    const [dropdownMode, setDropdownMode] = useState('search')
    const overlayRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setNavBook(null)
            setDropdownMode('search')
        }
    }, [isOpen])

    if (!isOpen) return null

    function handleSearchSubmit(rawQuery) {
        if (!rawQuery.trim()) return
        const parsed = parseSearch(rawQuery)

        if (parsed?.type === 'passage') {
            // Single passage with no specific verse — navigate directly
            if (!parsed.verseStart) {
                onSelectPassage({ book: parsed.book, chapter: parsed.chapter ?? 1 })
            } else {
                // Has a specific verse — go to search so the verse is highlighted
                onSearch(rawQuery)
            }
        } else if (parsed?.type === 'multi-passage') {
            // Always send to search results
            onSearch(rawQuery)
        } else {
            onSearch(rawQuery)
        }
        onClose()
    }

    function handleSuggestionSelect(suggestion) {
        handleSearchSubmit(suggestion.query)
    }

    function handleSelectBook(book) {
        setNavBook(book)
        setDropdownMode('nav')
    }

    function handleSelectChapter(chapter) {
        onSelectPassage({ book: navBook, chapter })
        onClose()
    }

    function handleOverlayClick(e) {
        if (e.target === overlayRef.current) onClose()
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 bg-black/20"
        >
            <div className="bg-white border-b border-gray-100 shadow-sm w-full max-h-[85vh] overflow-y-auto">
                {/* Search input row */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <SearchInput
                                autoFocus
                                onSearch={handleSearchSubmit}
                                onQueryChange={setQuery}
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-400 hover:text-gray-700 shrink-0 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="px-4 py-3">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-4 border-b border-gray-100">
                        {[
                            { id: 'search', label: 'Search' },
                            { id: 'nav', label: 'Browse' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setDropdownMode(id)}
                                className={`
                  pb-2 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${dropdownMode === id
                                        ? 'text-gray-900 border-gray-900'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'}
                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Search mode */}
                    {dropdownMode === 'search' && (
                        <AutocompleteList
                            query={query}
                            onSelect={handleSuggestionSelect}
                        />
                    )}

                    {/* Browse — book grid */}
                    {dropdownMode === 'nav' && !navBook && (
                        <BookGrid
                            selectedBook={selectedBook}
                            onSelectBook={handleSelectBook}
                        />
                    )}

                    {/* Browse — chapter grid */}
                    {dropdownMode === 'nav' && navBook && (
                        <ChapterGrid
                            book={navBook}
                            selectedChapter={selectedBook === navBook ? selectedChapter : null}
                            onSelectChapter={handleSelectChapter}
                            onBack={() => setNavBook(null)}
                        />
                    )}

                    {/* Version selector */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <VersionSelector
                            activeVersionId={activeVersionId}
                            onSelect={onSelectVersion}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
