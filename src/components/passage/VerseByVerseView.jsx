import { useMemo, useState, useRef, useEffect } from 'react'
import HoverableWord from './HoverableWord.jsx'
import { SECTION_HEADINGS } from '../../data/mockVerses.js'
import { stripCantillation } from '../../utils/parser.js'
import { EnglishWithHighlight } from './EnglishWithHighlight.jsx'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

function findOriginalEntry(versions) {
    return Object.entries(versions).find(
        ([versionId]) => ORIGINAL_VERSION_IDS.includes(versionId)
    ) ?? null
}

// Props:
//   verses      — MOCK_VERSES[]
//   versionId   — string (English translation)

export default function VerseByVerseView({ verses, versionId, highlightVerse }) {
    const highlightRef = useRef(null)

    const [hoveredStrongsNumber, setHoveredStrongsNumber] = useState(null)

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
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
            {verses.map(verse => {
                const { verseId, verse: verseNum, versions } = verse
                const heading = SECTION_HEADINGS[verseId]
                const englishText = versions[versionId]?.text ?? ''
                const originalEntry = findOriginalEntry(versions)
                const isHebrew = originalEntry?.[0] === 'WLC'

                return (
                    <div key={verseId}>
                        <div
                            ref={verse.verse === highlightVerse ? highlightRef : null}
                            className={`flex gap-4 ${verse.verse === highlightVerse ? 'bg-amber-50 -mx-4 px-4 py-1 rounded-lg' : ''}`}
                        >

                            {heading && (
                                <h2 className="text-base font-semibold text-gray-700 mt-2 mb-4">
                                    {heading}
                                </h2>
                            )}

                            <div className="flex gap-4">
                                {/* Verse number */}
                                <span className="text-xs text-gray-300 font-medium pt-1.5 shrink-0 w-5 text-right select-none">
                                    {verseNum}
                                </span>

                                <div className="flex-1 space-y-3">
                                    {/* English */}
                                    <p className="text-[16px] leading-8 text-gray-800">
                                        <EnglishWithHighlight
                                            text={englishText}
                                            hoveredStrongsNumber={hoveredStrongsNumber}
                                            originalWords={originalEntry?.[1]?.words ?? []}
                                        />
                                    </p>

                                    {/* Original language — always shown when present */}
                                    {originalEntry && (
                                        <p
                                            dir={isHebrew ? 'rtl' : 'ltr'}
                                            className="text-sm leading-8 text-gray-400 font-serif flex flex-wrap gap-x-1"
                                        >
                                            {originalEntry[1].words?.length
                                                ? originalEntry[1].words.map(word => (
                                                    <HoverableWord
                                                        key={word.wordId}
                                                        word={word}
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
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}