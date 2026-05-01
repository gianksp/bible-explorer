import LoadingState from './ui/LoadingState.jsx'
import EmptyState from './ui/EmptyState.jsx'
import SectionLabel from './ui/SectionLabel.jsx'
import VerseReference from './ui/VerseReference.jsx'

export default function OccurrenceList({ occurrences, isLoading, onSelectVerse }) {
    if (isLoading) return <LoadingState message="Loading occurrences…" />
    if (!occurrences?.length) return <EmptyState message="No occurrences found" />

    return (
        <div>
            <SectionLabel label={`${occurrences.length.toLocaleString()} occurrences`} />
            {occurrences.map(occurrence => (
                <OccurrenceItem
                    key={occurrence.verseId}
                    occurrence={occurrence}
                    onSelect={onSelectVerse}
                />
            ))}
        </div>
    )
}

function OccurrenceItem({ occurrence, onSelect }) {
    const { book, chapter, verse, snippet, matchedTerms } = occurrence

    return (
        <div className="py-2 border-b border-gray-100">
            <VerseReference
                book={book}
                chapter={chapter}
                verse={verse}
                onClick={() => onSelect({ book, chapter, verse })}
            />
            <div className="text-xs text-gray-500 leading-relaxed mt-0.5">
                {highlightSnippet(snippet, matchedTerms)}
            </div>
        </div>
    )
}

function highlightSnippet(snippet, matchedTerms) {
    if (!matchedTerms?.length) return snippet

    const escapedTerms = matchedTerms.map(term =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = snippet.split(pattern)

    return parts.map((part, index) => {
        const isMatch = matchedTerms.some(term =>
            part.toLowerCase() === term.toLowerCase()
        )
        return isMatch
            ? <mark key={index} className="bg-amber-200 text-amber-900 px-0.5 rounded-sm">{part}</mark>
            : part
    })
}