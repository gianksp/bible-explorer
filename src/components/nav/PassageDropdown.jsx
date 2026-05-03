import { useState, useEffect } from 'react'
import SearchInput from './SearchInput.jsx'
import AutocompleteList from './AutocompleteList.jsx'
import BookGrid from './BookGrid.jsx'
import ChapterGrid from './ChapterGrid.jsx'
import VersionSelector from './VersionSelector.jsx'
import { parseSearch } from '../../data/searchParser.js'

export default function PassageDropdown({
    isOpen,
    selectedBook,
    selectedChapter,
    activeVersionIds,
    showInterlinear,
    onClose,
    onSelectPassage,
    onSearch,
    onToggleVersion,
    onToggleInterlinear,
}) {
    const [query, setQuery] = useState('')
    const [navBook, setNavBook] = useState(null)
    const [dropdownMode, setDropdownMode] = useState('search')
    const [mounted, setMounted] = useState(false)
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setMounted(true)
            setQuery('')
            setNavBook(null)
            setDropdownMode('search')
            const t = setTimeout(() => setShow(true), 10)
            return () => clearTimeout(t)
        } else {
            setShow(false)
            const t = setTimeout(() => setMounted(false), 300)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    if (!mounted) return null

    function handleSearchSubmit(rawQuery) {
        if (!rawQuery.trim()) return
        const parsed = parseSearch(rawQuery)
        if (parsed?.type === 'passage' && !parsed.verseStart) {
            onSelectPassage({ book: parsed.book, chapter: parsed.chapter ?? 1 })
        } else {
            onSearch(rawQuery)
        }
        onClose()
    }

    function handleSelectBook(book) {
        setNavBook(book)
        setDropdownMode('nav')
    }

    function handleSelectChapter(chapter) {
        onSelectPassage({ book: navBook, chapter })
        onClose()
    }

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, top: '53px', zIndex: 30,
                    background: 'rgba(0,0,0,0.25)',
                    opacity: show ? 1 : 0,
                    transition: 'opacity 300ms ease',
                }}
            />

            <div
                style={{
                    position: 'fixed', left: 0, right: 0, top: '53px', zIndex: 40,
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: show ? 'translateY(0)' : 'translateY(-100%)',
                    opacity: show ? 1 : 0,
                    transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease',
                    maxHeight: '85vh',
                    overflowY: 'scroll',
                    scrollbarGutter: 'stable',
                }}
            >
                <div style={{ maxWidth: '672px', margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ padding: '16px 0 12px', borderBottom: '1px solid #f3f4f6' }}>
                        <SearchInput autoFocus onSearch={handleSearchSubmit} onQueryChange={setQuery} />
                    </div>

                    <div className="py-3">
                        <div className="flex gap-4 mb-4 border-b border-gray-100">
                            {[{ id: 'search', label: 'Search' }, { id: 'nav', label: 'Browse' }].map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setDropdownMode(id)}
                                    className={`pb-2 text-sm font-medium border-b-2 transition-colors -mb-px
                    ${dropdownMode === id ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {dropdownMode === 'search' && (
                            <AutocompleteList query={query} onSelect={s => handleSearchSubmit(s.query)} />
                        )}
                        {dropdownMode === 'nav' && !navBook && (
                            <BookGrid selectedBook={selectedBook} onSelectBook={handleSelectBook} />
                        )}
                        {dropdownMode === 'nav' && navBook && (
                            <ChapterGrid
                                book={navBook}
                                selectedChapter={selectedBook === navBook ? selectedChapter : null}
                                onSelectChapter={handleSelectChapter}
                                onBack={() => setNavBook(null)}
                            />
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                            <VersionSelector
                                activeVersionIds={activeVersionIds}
                                onToggle={onToggleVersion}
                            />

                            {/* Interlinear toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-gray-700">Interlinear</div>
                                    <div className="text-xs text-gray-400">Show original language below each verse</div>
                                </div>
                                <button
                                    onClick={onToggleInterlinear}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${showInterlinear ? 'bg-gray-900' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                    ${showInterlinear ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
