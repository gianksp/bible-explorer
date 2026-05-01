import { useMemo, useState, useEffect, useRef } from 'react'
import HoverableWord from './HoverableWord.jsx'
import { SECTION_HEADINGS } from '../../data/mockVerses.js'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

function findOriginalEntry(versions) {
    return Object.entries(versions).find(
        ([versionId]) => ORIGINAL_VERSION_IDS.includes(versionId)
    ) ?? null
}

// Strip Hebrew cantillation marks — keep base letters + vowel points
function stripCantillation(text) {
    return (text ?? '')
        .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
        .replace(/[/\\׃¶]/g, '')
        .trim()
}

// Props:
//   verses         — MOCK_VERSES[]
//   versionId      — string (English translation)
//   highlightVerse — number | null — scrolls to and highlights this verse
//   highlightTerms — string[] — highlights these words in English text (for search)

export default function VerseByVerseView({
    verses,
    versionId,
    highlightVerse = null,
    highlightTerms = [],
}) {
    const [hoveredStrongsNumber, setHoveredStrongsNumber] = useState(null)
    const highlightRef = useRef(null)

    // Scroll to highlighted verse when it changes
    useEffect(() => {
        if (highlightVerse && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [highlightVerse, verses])

    // Count how many times each strongsNumber appears in this set of verses
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
                const isHighlighted = verseNum === highlightVerse

                return (
                    <div
                        key={verseId}
                        ref={isHighlighted ? highlightRef : null}
                        className={isHighlighted
                            ? 'bg-amber-50 -mx-4 px-4 py-2 rounded-lg'
                            : ''
                        }
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
                                {/* English text — with search term highlights if present */}
                                <p className="text-[17px] leading-8 text-gray-800">
                                    <EnglishText
                                        text={englishText}
                                        highlightTerms={highlightTerms}
                                        hoveredStrongsNumber={hoveredStrongsNumber}
                                        originalWords={originalEntry?.[1]?.words ?? []}
                                    />
                                </p>

                                {/* Original language — always shown, hoverable */}
                                {originalEntry && (
                                    <p
                                        dir={isHebrew ? 'rtl' : 'ltr'}
                                        className="text-sm leading-8 text-gray-400 font-serif flex flex-wrap gap-x-1"
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
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Renders English text with two types of highlights:
// 1. Search term highlights (highlightTerms) — amber background
// 2. Strongs hover highlights — highlights the gloss word matching hovered original word
function EnglishText({ text, highlightTerms, hoveredStrongsNumber, originalWords }) {
    if (!text) return null

    // Find glosses for hovered strongs number
    const hoveredGlosses = hoveredStrongsNumber
        ? originalWords
            .filter(w => w.strongsNumber === hoveredStrongsNumber)
            .map(w => w.englishGloss?.toLowerCase().trim())
            .filter(Boolean)
        : []

    // Split text preserving whitespace
    const parts = text.split(/(\s+)/)

    return (
        <>
            {parts.map((part, i) => {
                const clean = part.toLowerCase().replace(/[.,;:!?'"()]/g, '').trim()
                if (!clean) return <span key={i}>{part}</span>

                // Search term match — stronger highlight
                const isSearchMatch = highlightTerms.some(term =>
                    clean === term.toLowerCase() || clean.includes(term.toLowerCase())
                )

                // Strongs hover match
                const isStrongsMatch = hoveredGlosses.some(gloss =>
                    gloss.split(/[\s/]+/).some(glossWord => clean === glossWord)
                )

                if (isSearchMatch) {
                    return (
                        <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm">
                            {part}
                        </mark>
                    )
                }

                if (isStrongsMatch) {
                    return (
                        <mark key={i} className="bg-amber-100 text-amber-800 rounded-sm">
                            {part}
                        </mark>
                    )
                }

                return <span key={i}>{part}</span>
            })}
        </>
    )
}
