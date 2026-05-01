import { useState } from 'react'

// Props:
//   initialQuery  — string, pre-fills the input (e.g. from URL params)
//   onSearch      — fn(rawQuery: string) called on submit
//   isLoading     — bool, disables input while fetching

const SEARCH_PLACEHOLDER = 'John 3:16, G3056, "in the beginning", love OR faith'

export default function SearchBar({ initialQuery = '', onSearch, isLoading }) {
    const [query, setQuery] = useState(initialQuery)

    function handleSubmit(event) {
        event.preventDefault()
        const trimmedQuery = query.trim()
        if (trimmedQuery) onSearch(trimmedQuery)
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') handleSubmit(event)
    }

    function handleClear() {
        setQuery('')
        onSearch('')
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full"
        >
            <div className="relative flex-1">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={SEARCH_PLACEHOLDER}
                    disabled={isLoading}
                    className="
            w-full px-4 py-2.5 pr-8 text-sm rounded-lg border border-gray-200
            bg-white placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed
          "
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="
          px-4 py-2.5 text-sm font-medium rounded-lg
          bg-blue-600 text-white
          hover:bg-blue-700 active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all shrink-0
        "
            >
                {isLoading ? 'Searching…' : 'Search'}
            </button>
        </form>
    )
}