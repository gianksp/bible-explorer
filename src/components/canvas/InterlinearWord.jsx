import { useMemo, useState, useEffect, useRef } from 'react'
import WordGlossCard from './WordGlossCard.jsx'

export function InterlinearWord({ word, isHighlighted, onHoverStart, onHoverEnd, pageOccurrences }) {
    const [showGloss, setShowGloss] = useState(false)
    const wrapperRef = useRef(null)
    const isActive = isHighlighted || showGloss

    function handleMouseEnter() { onHoverStart(word.strongsNumber); setShowGloss(true) }
    function handleMouseLeave(e) {
        if (wrapperRef.current?.contains(e.relatedTarget)) return
        onHoverEnd(); setShowGloss(false)
    }
    function handleClick(e) {
        e.stopPropagation()
        const next = !showGloss
        setShowGloss(next)
        next ? onHoverStart(word.strongsNumber) : onHoverEnd()
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
            <span className={`text-xs mb-0.5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                {word.strongsNumber}
            </span>
            <span className={`text-sm italic mb-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}>
                {word.transliteration || '—'}
            </span>
            <span className={`font-serif font-medium leading-tight mb-1 tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                {word.surface}
            </span>
            <span className={`text-md font-medium mb-0.5 ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                {word.englishGloss || '—'}
            </span>
            <span className={`text-xs font-mono ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                {word.morphology}
            </span>

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

