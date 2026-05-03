import { useMemo, useState, useEffect, useRef } from 'react'
import WordGlossCard from './WordGlossCard'

export const InterlinearWord = ({ word, isHighlighted, onHoverStart, onHoverEnd, pageOccurrences }) => {
    const [showGloss, setShowGloss] = useState(false)
    const wrapperRef = useRef(null)

    const { surface, transliteration, englishGloss, strongsNumber, morphology } = word
    const isActive = isHighlighted || showGloss

    function handleMouseEnter() {
        onHoverStart(strongsNumber)
        setShowGloss(true)
    }

    function handleMouseLeave(e) {
        if (wrapperRef.current?.contains(e.relatedTarget)) return
        onHoverEnd()
        setShowGloss(false)
    }

    function handleClick(e) {
        e.stopPropagation()
        const next = !showGloss
        setShowGloss(next)
        next ? onHoverStart(strongsNumber) : onHoverEnd()
    }

    return (
        <div
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className={`
        relative flex flex-col items-center text-center cursor-pointer
        px-2 py-1.5 rounded-lg transition-colors duration-100 min-w-[40px]
        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
        >
            {/* Strong's number */}
            <span className={`text-[12px] font-medium mb-0.5 ${isActive ? 'text-blue-600' : 'text-blue-400'}`}>
                {strongsNumber}
            </span>

            {/* Transliteration */}
            <span className={`text-[14px] italic mb-1 ${isActive ? 'text-blue-700' : 'text-blue-500'}`}>
                {transliteration || '—'}
            </span>

            {/* Surface text — large, prominent */}
            <span className={`
        font-serif text-[18px] leading-tight mb-1 tracking-wide
        ${isActive ? 'text-blue-700' : 'text-gray-700'}
      `}>
                {surface}
            </span>

            {/* English gloss */}
            <span className={`text-[15px] font-medium mb-0.5 ${isActive ? 'text-orange-600' : 'text-orange-400'}`}>
                {englishGloss || '—'}
            </span>

            {/* Morphology */}
            <span className={`text-[12px] font-mono ${isActive ? 'text-blue-600' : 'text-blue-400'}`}>
                {morphology}
            </span>

            {/* Gloss card */}
            {showGloss && (
                <WordGlossCard
                    word={word}
                    pageOccurrences={pageOccurrences}
                    onClose={() => { setShowGloss(false); onHoverEnd() }}
                />
            )}
        </div>
    )
}