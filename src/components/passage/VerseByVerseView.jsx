import { useMemo, useState, useEffect, useRef } from 'react'
import WordGlossCard from './WordGlossCard.jsx'
import { VerseNum } from "./VerseNum"
import { InterlinearWord } from './InterlinearWord.jsx'
import { EnglishText } from './EnglishText.jsx'

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
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
            {verses.map(verse => {
                const { verseId, verse: verseNum, versions } = verse
                const englishText = versions[versionId]?.text ?? ''
                const originalEntry = findOriginalEntry(versions)
                const isHebrew = originalEntry?.[0] === 'WLC'
                const isHighlighted = verseNum === highlightVerse
                const verseHasHoveredWord = hoveredStrongsNumber &&
                    originalEntry?.[1]?.words?.some(w => w.strongsNumber === hoveredStrongsNumber)

                return (
                    <div
                        key={verseId}
                        ref={isHighlighted ? highlightRef : null}
                        className={`
              transition-colors duration-150 rounded-lg
              ${isHighlighted ? 'bg-amber-50 -mx-2 px-2 py-2' : ''}
            `}
                    >
                        {/* English translation */}
                        <p className="text-[17px] leading-8 text-gray-800 mb-4">
                            <VerseNum verseNum={verseNum} />
                            <EnglishText text={englishText} highlightTerms={highlightTerms} />
                        </p>

                        {/* Interlinear */}
                        {originalEntry?.[1]?.words?.length > 0 && (
                            <div
                                dir={isHebrew ? 'rtl' : 'ltr'}
                                className="flex flex-wrap gap-x-1 gap-y-3 border-b border-gray-200 pt-3 pb-8"
                            >
                                {originalEntry[1].words.map(word => (
                                    <InterlinearWord
                                        key={word.wordId}
                                        word={{ ...word, surface: stripCantillation(word.surface) }}
                                        isHighlighted={hoveredStrongsNumber === word.strongsNumber}
                                        onHoverStart={setHoveredStrongsNumber}
                                        onHoverEnd={() => setHoveredStrongsNumber(null)}
                                        pageOccurrences={strongsPageCount[word.strongsNumber] ?? 1}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
