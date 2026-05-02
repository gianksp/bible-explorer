import { useMemo, useState, useEffect, useRef } from 'react'
import HoverableWord from './HoverableWord.jsx'

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

                    return (
                        <div
                            key={verseId}
                            ref={isHighlighted ? highlightRef : null}
                            className={isHighlighted ? 'bg-amber-50 -mx-2 px-2 py-1 rounded-lg' : ''}
                        >
                            

                            {/* English — verse number as superscript, same as ReaderView */}
                            <p className="text-[17px] leading-8 text-gray-800">
                                <sup className="text-[10px] text-gray-400 mr-0.5 select-none font-normal">
                                    {verseNum}
                                </sup>
                                <EnglishText
                                    text={englishText}
                                    highlightTerms={highlightTerms}
                                    hoveredStrongsNumber={hoveredStrongsNumber}
                                    originalWords={originalEntry?.[1]?.words ?? []}
                                />
                            </p>

                            {/* Original language below */}
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
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function EnglishText({ text, highlightTerms, hoveredStrongsNumber, originalWords }) {
    if (!text) return null

    const hoveredGlosses = hoveredStrongsNumber
        ? originalWords
            .filter(w => w.strongsNumber === hoveredStrongsNumber)
            .map(w => w.englishGloss?.toLowerCase().trim())
            .filter(Boolean)
        : []

    const parts = text.split(/(\s+)/)

    return (
        <>
            {parts.map((part, i) => {
                const clean = part.toLowerCase().replace(/[.,;:!?'"()]/g, '').trim()
                if (!clean) return <span key={i}>{part}</span>

                const isSearchMatch = highlightTerms.some(term =>
                    clean === term.toLowerCase() || clean.includes(term.toLowerCase())
                )
                const isStrongsMatch = hoveredGlosses.some(gloss =>
                    gloss.split(/[\s/]+/).some(glossWord => clean === glossWord)
                )

                if (isSearchMatch) return <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{part}</mark>
                if (isStrongsMatch) return <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm px-0.5">{part}</mark>
                return <span key={i}>{part}</span>
            })}
        </>
    )
}
