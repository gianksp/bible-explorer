// Props:
//   query       — string
//   onSelect    — fn(suggestion)

const STATIC_SUGGESTIONS = [
    { label: 'Genesis 1', query: 'Gen 1', type: 'passage' },
    { label: 'John 1:1', query: 'John 1:1', type: 'passage' },
    { label: 'John 3:16', query: 'John 3:16', type: 'passage' },
    { label: 'Psalm 23', query: 'Ps 23', type: 'passage' },
    { label: 'Isaiah 53', query: 'Isa 53', type: 'passage' },
    { label: 'Romans 8', query: 'Rom 8', type: 'passage' },
    { label: 'Revelation 1', query: 'Rev 1', type: 'passage' },
    { label: 'λόγος · G3056', query: 'G3056', type: 'strongs' },
    { label: 'θεός · G2316', query: 'G2316', type: 'strongs' },
    { label: 'YHWH · H3068', query: 'H3068', type: 'strongs' },
    { label: '"in the beginning"', query: '"in the beginning"', type: 'keyword' },
    { label: 'love OR faith', query: 'love OR faith', type: 'keyword' },
]

const TYPE_LABELS = {
    passage: 'Passage',
    strongs: 'Strong\'s',
    keyword: 'Keyword',
}

export default function AutocompleteList({ query, onSelect }) {
    const filtered = query.trim()
        ? STATIC_SUGGESTIONS.filter(s =>
            s.label.toLowerCase().includes(query.toLowerCase()) ||
            s.query.toLowerCase().includes(query.toLowerCase())
        )
        : STATIC_SUGGESTIONS

    if (!filtered.length) return null

    return (
        <div className="mt-1">
            {filtered.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left transition-colors rounded-lg"
                >
                    <span className="text-sm text-gray-800">{suggestion.label}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {TYPE_LABELS[suggestion.type]}
                    </span>
                </button>
            ))}
        </div>
    )
}