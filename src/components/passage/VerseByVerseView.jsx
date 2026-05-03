import { useMemo, useState, useEffect, useRef } from 'react'
import HoverableWord from './HoverableWord.jsx'
import { VerseNum } from './VerseNum.jsx'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

function findOriginalEntry(versions) {
    return Object.entries(versions).find(
        ([versionId]) => ORIGINAL_VERSION_IDS.includes(versionId)
    ) ?? null
}

function stripCantillation(text) {
    return (text ?? '')
        .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
        .replace(/[/\\׃¶]/g, '')
        .trim()
}

// Props:
//   verses         — verse objects array
//   versionId      — string
//   highlightVerse — number | null
//   highlightTerms — string[]

export default function VerseByVerseView({
    verses,
    versionId,
    highlightVerse = null,
    highlightTerms = [],
}) {
    const [hoveredStrongsNumber, setHoveredStrongsNumber] = useState(null)
    const highlightRef = useRef(null)

    useEffect(() => {
        if (highlightVerse && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [highlightVerse, verses])

    const strongsPageCount = useMemo(() => {
        const counts = {}
        if (!verses) return counts
        verses.forEach(verse => {
            Object.values(verse.versions)
                .flatMap(v => v.words ?? [])
                .forEach(word => {
                    counts[word.strongsNumber] = (counts[word.strongsNumber] ?? 0) + 1
                })
        })
        return counts
    }, [verses])

    if (!verses?.length) return null

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="space-y-6">
                {verses.map(verse => {
                    const { verseId, verse: verseNum, versions } = verse
                    const englishText = versions[versionId]?.text ?? ''
                    const originalEntry = findOriginalEntry(versions)
                    const isHebrew = originalEntry?.[0] === 'WLC'
                    const isHighlighted = verseNum === highlightVerse

                    // Highlight this verse if it contains the hovered word
                    const verseHasHoveredWord = hoveredStrongsNumber &&
                        originalEntry?.[1]?.words?.some(w => w.strongsNumber === hoveredStrongsNumber)

                    return (
                        <div
                            key={verseId}
                            ref={isHighlighted ? highlightRef : null}
                            className={`
                transition-colors duration-150 rounded-lg
                ${isHighlighted ? 'bg-amber-50' : ''}
              `}
                        >
                            {/* English — plain, no word-level highlights from hover */}
                            <p className={`text-[17px] leading-8 text-gray-800 mb-4
                ${verseHasHoveredWord && !isHighlighted ? 'bg-amber-50' : ''}`}>
                                <VerseNum verseNum={verseNum} />
                                <EnglishText
                                    text={englishText}
                                    highlightTerms={highlightTerms}
                                />
                            </p>

                            {/* Original language */}
                            {originalEntry && (
                                <p
                                    dir={isHebrew ? 'rtl' : 'ltr'}
                                    className="text-sm leading-8 text-gray-400 font-serif flex flex-wrap gap-x-1 mt-1"
                                >
                                    {originalEntry[1].words?.length
                                        ? originalEntry[1].words.map(word => (
                                            <HoverableWord
                                                key={word.wordId}
                                                word={{ ...word, surface: stripCantillation(word.surface) }}
                                                isHighlighted={hoveredStrongsNumber === word.strongsNumber}
                                                onHoverStart={setHoveredStrongsNumber}
                                                onHoverEnd={() => setHoveredStrongsNumber(null)}
                                                pageOccurrences={strongsPageCount[word.strongsNumber] ?? 1}
                                            />
                                        ))
                                        : <span>{stripCantillation(originalEntry[1].text)}</span>
                                    }
                                </p>
                            )}
                            <div class="h-px bg-neutral-200 my-8 opacity-60"></div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Only highlights search terms — no Strong's word matching
function EnglishText({ text, highlightTerms }) {
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
                    ? <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm">{part}</mark>
                    : part
            })}
        </>
    )
}
