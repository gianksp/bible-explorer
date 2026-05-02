// Props:
//   verses         — verse objects array
//   versionId      — string
//   highlightTerms — string[] (optional, for search results)

export default function ReaderView({ verses, versionId, highlightTerms = [] }) {
    if (!verses?.length) return null

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {/* <div className="pl-9"> */}
                {verses.map(verse => {
                    const { verseId, verse: verseNum, versions } = verse
                    const text = versions[versionId]?.text ?? ''

                    return (
                        <span key={verseId}>
                            <sup className="text-[10px] text-gray-400 mr-0.5 select-none font-normal">
                                {verseNum}
                            </sup>
                            <span className="text-[17px] text-gray-800 leading-8">
                                {highlightTerms.length > 0
                                    ? highlightText(text, highlightTerms)
                                    : text
                                }{' '}
                            </span>
                        </span>
                    )
                })}
            {/* </div> */}
        </div>
    )
}

function highlightText(text, terms) {
    const escapedTerms = terms.map(t =>
        t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = text.split(pattern)

    return parts.map((part, i) => {
        const isMatch = terms.some(t => part.toLowerCase() === t.toLowerCase())
        return isMatch
            ? <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark>
            : part
    })
}
