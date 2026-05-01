export default function VerseRow({
    versionId,
    versionLabel,
    text,
    highlightTerms = [],
    isOriginal = false,
}) {
    const renderedText = highlightTerms.length > 0
        ? highlightMatches(text, highlightTerms)
        : text

    return (
        <div className="flex gap-4 items-baseline py-2">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest min-w-[38px] shrink-0">
                {versionLabel ?? versionId}
            </span>
            <span className={`text-[15px] leading-7 ${isOriginal ? 'font-serif' : ''} ${isOriginal && versionId === 'WLC' ? 'direction-rtl' : ''}`}>
                {renderedText}
            </span>
        </div>
    )
}

function highlightMatches(text, terms) {
    if (!terms.length) return text

    const escapedTerms = terms.map(term =>
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = text.split(pattern)

    return parts.map((part, index) => {
        const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase())
        return isMatch
            ? <mark key={index} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark>
            : part
    })
}