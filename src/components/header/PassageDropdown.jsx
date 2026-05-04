import { useState, useEffect } from 'react'
import SearchInput from './SearchInput.jsx'
import AutocompleteList from './AutocompleteList.jsx'
import BookGrid from './BookGrid.jsx'
import ChapterGrid from './ChapterGrid.jsx'
import VersionSelector from './VersionSelector.jsx'
import { parseSearch } from '../../data/searchParser.js'
import { DropdownToggleButton } from '../ui/ToggleButton.jsx'

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
            setDropdownMode('translation')
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
                    position: 'fixed', inset: 0, top: '44px', zIndex: 30,
                    background: 'rgba(0,0,0,0.25)',
                    opacity: show ? 1 : 0,
                    transition: 'opacity 300ms ease',
                }}
            />

            <div
                style={{
                    position: 'fixed', left: 0, right: 0, top: '44px', zIndex: 40,
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: show ? 'translateY(0)' : 'translateY(-100%)',
                    opacity: show ? 1 : 0,
                    transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease',
                    maxHeight: '85vh',
                    overflowY: 'scroll',
                    scrollbarGutter: 'stable',
                    paddingBottom: '32px'
                }}
            >
                <div style={{ maxWidth: '672px', margin: '0 auto', padding: '0 16px' }}>




                    <div className="space-y-4 mb-4 mt-8">

                        <SearchInput autoFocus onSearch={handleSearchSubmit} onQueryChange={setQuery} />
                        {/* 
                        <div className="border-t border-gray-200 my-4" />

                        <DropdownToggleButton onToggle={onToggleInterlinear} isActive={showInterlinear} title="Show Original Language" />

                        <div className="border-t border-gray-200 my-4" />

                        <VersionSelector activeVersionIds={activeVersionIds} onToggle={onToggleVersion} /> */}

                    </div>

                    <div>



                        <div className="flex gap-4 mb-4 border-b border-gray-100">
                            {[
                                { id: 'translation', label: 'Language Options' },
                                { id: 'search', label: 'Recommended Readings' },
                                { id: 'nav', label: 'Browse Books' }
                            ].map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setDropdownMode(id)}
                                    className={`pb-2 text-sm font-medium border-b-1 transition-colors -mb-px cursor-pointer
                    ${dropdownMode === id ? 'text-gray-700 border-gray-200' : 'text-gray-300 border-transparent hover:text-gray-400'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {dropdownMode === 'translation' && (
                            <>

                                <DropdownToggleButton onToggle={onToggleInterlinear} isActive={showInterlinear} title="Show Original Language" />

                                <div className="border-t border-gray-200 my-4" />

                                <VersionSelector activeVersionIds={activeVersionIds} onToggle={onToggleVersion} />
                            </>
                        )}
                        {dropdownMode === 'search' && (
                            <AutocompleteList
                                query={query}
                                onSelect={s => handleSearchSubmit(s.query)}
                                onLoadAll={rawQuery => { onSearch(rawQuery); onClose() }}
                            />
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


                    </div>
                </div>
            </div>
        </>
    )
}
