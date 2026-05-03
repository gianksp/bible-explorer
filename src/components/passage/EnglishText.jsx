export const EnglishText = ({ text, highlightTerms }) => {
    if (!text) return null
    if (!highlightTerms?.length) return <>{text}</>

    const escapedTerms = highlightTerms.map(t =>
        t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = text.split(pattern)

    return (
        <>
            {parts.map((part, i) => {
                const isMatch = highlightTerms.some(t => part.toLowerCase() === t.toLowerCase())
                return isMatch
                    ? <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark>
                    : part
            })}
        </>
    )
}