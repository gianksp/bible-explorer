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
        if (e.key === 'Escape') { setQuery(''); onQueryChange?.('') }
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
                placeholder="Search — John 3:16, G3056, love OR faith…"
                className="
          w-full px-4 py-3 pr-10 text-sm bg-gray-50 rounded-xl
          border border-gray-200 text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300
          transition-all
        "
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                    ×
                </button>
            )}
        </div>
    )
}
