import { useState, useRef, useEffect } from 'react'

// Props:
//   onSearch      — fn(rawQuery) called on Enter
//   onQueryChange — fn(rawQuery) called on every keystroke
//   autoFocus     — bool

export default function SearchInput({ onSearch, onQueryChange, autoFocus = false }) {
    const [query, setQuery] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus()
    }, [autoFocus])

    function handleChange(e) {
        const value = e.target.value
        setQuery(value)
        onQueryChange?.(value)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && query.trim()) onSearch(query.trim())
        if (e.key === 'Escape') {
            setQuery('')
            onQueryChange?.('')
        }
    }

    function handleClear() {
        setQuery('')
        onQueryChange?.('')
        inputRef.current?.focus()
    }

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter passage, keyword or topic"
                className="
          w-full px-4 py-3 pr-10 text-sm bg-gray-50 rounded-lg
          border border-gray-500 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400
          transition-all
        "
            />
            {query && (
                <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={handleClear}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                    aria-label="Clear search"
                >
                    <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5 text-white">
                        <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    )
}
