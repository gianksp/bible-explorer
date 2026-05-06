import { useMemo, useState, useEffect, useRef } from 'react'
import { VerseNum } from './VerseNum.jsx'
import { EnglishText } from './EnglishText.jsx'
import { InterlinearWord } from './InterlinearWord.jsx'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

function findOriginalEntry(versions) {
    return Object.entries(versions).find(
        ([id]) => ORIGINAL_VERSION_IDS.includes(id)
    ) ?? null
}

function stripCantillation(text) {
    return (text ?? '')
        .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
        .replace(/[/\\׃¶]/g, '')
        .trim()
}

// Props:
//   verses          — verse objects
//   versionIds      — string[]
//   showInterlinear — bool
//   highlightVerse  — number | null
//   highlightTerms  — string[]
//   variant         — 'default' | 'parallel'
//     default  — stacked, one translation per line (main reader)
//     parallel — side-by-side columns per translation (preview/compare)

export default function PassageView({
    verses,
    versionIds = [],
    showInterlinear = false,
    highlightVerse = null,
    highlightTerms = [],
    variant = 'default',
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

    const englishIds = versionIds.filter(id => !ORIGINAL_VERSION_IDS.includes(id))
    const isMulti = englishIds.length > 1
    const hasEnglish = englishIds.length > 0
    const originalOnly = !hasEnglish && showInterlinear

    // ── Parallel variant — columns side by side ───────────────────────────────
    if (variant === 'parallel' && isMulti) {
        return (
            <div className="px-2 py-2">
                {/* Version header row */}
                <div
                    className="grid gap-3 mb-2"
                    style={{ gridTemplateColumns: `repeat(${englishIds.length}, 1fr)` }}
                >
                    {englishIds.map(id => (
                        <div key={id} className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            {id}
                        </div>
                    ))}
                </div>

                {/* Verse rows */}
                {verses.map(verse => {
                    const { verseId, verse: verseNum, versions } = verse
                    return (
                        <div
                            key={verseId}
                            className="grid gap-3 mb-3 pb-3 border-b border-gray-100 last:border-0"
                            style={{ gridTemplateColumns: `repeat(${englishIds.length}, 1fr)` }}
                        >
                            {englishIds.map((versionId, i) => {
                                const text = versions[versionId]?.text ?? ''
                                return (
                                    <p key={versionId} className="text-[13px] leading-6 text-gray-700">
                                        {i === 0 && (
                                            <sup className="text-[10px] text-gray-400 mr-0.5 select-none font-normal">
                                                {verseNum}
                                            </sup>
                                        )}
                                        <EnglishText text={text} highlightTerms={highlightTerms} />
                                    </p>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        )
    }

    // ── Default variant — stacked ─────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {verses.map(verse => {
                const { verseId, verse: verseNum, versions } = verse
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
              mb-1 transition-colors duration-150 rounded-lg
              ${isHighlighted ? 'bg-amber-50 -mx-2 px-2 py-1' : ''}
              ${verseHasHoveredWord && !isHighlighted ? 'bg-blue-50' : ''}
            `}
                    >
                        {/* English translations — stacked */}
                        {hasEnglish && englishIds.map((versionId, i) => {
                            const text = versions[versionId]?.text ?? ''
                            if (!text) return null
                            return (
                                <p key={versionId} className="text-[17px] leading-8 text-gray-800">
                                    <sup className={`text-[10px] mr-0.5 select-none font-normal ${i === 0 ? 'text-gray-400' : 'invisible'}`}>
                                        <VerseNum verseNum={verseNum} />
                                    </sup>
                                    {isMulti && (
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mr-1.5 select-none">
                                            {versionId}
                                        </span>
                                    )}
                                    <EnglishText text={text} highlightTerms={highlightTerms} />
                                </p>
                            )
                        })}

                        {/* Interlinear */}
                        {showInterlinear && originalEntry?.[1]?.words?.length > 0 && (
                            <div
                                dir={isHebrew ? 'rtl' : 'ltr'}
                                className={`flex flex-wrap gap-x-1 gap-y-3 ${hasEnglish ? 'mt-2 mb-3 pt-2 border-t border-gray-100' : 'mt-1 mb-2'}`}
                            >
                                {originalOnly && (
                                    <div className="w-full mb-1">
                                        <VerseNum verseNum={verseNum} />
                                    </div>
                                )}
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