// Props:
//   verses         — verse objects array
//   versionId      — string
//   highlightTerms — string[] (optional, for search results)

import { EnglishText } from "./EnglishText"
import { VerseNum } from "./VerseNum"

export default function ReaderView({ verses, versionId, highlightTerms = [] }) {
    if (!verses?.length) return null

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {/* <div className="pl-9"> */}
            {verses.map(verse => {
                const { verseId, verse: verseNum, versions } = verse
                const text = versions[versionId]?.text ?? ''

                return (
                    <p key={verseId} className="text-[17px] leading-8 text-gray-800 mb-4">
                        <VerseNum verseNum={verseNum} />
                        <EnglishText text={text} highlightTerms={highlightTerms} />
                    </p>
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
