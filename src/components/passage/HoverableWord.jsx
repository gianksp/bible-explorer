import { useState, useRef } from 'react'
import WordGlossCard from './WordGlossCard.jsx'
import { stripCantillation } from '../../utils/parser.js'

export default function HoverableWord({
    word,
    isHighlighted,
    onHoverStart,
    onHoverEnd,
    pageOccurrences,
}) {
    const [showGloss, setShowGloss] = useState(false)
    const wrapperRef = useRef(null)

    function handleMouseEnter() {
        onHoverStart(word.strongsNumber)
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
        next ? onHoverStart(word.strongsNumber) : onHoverEnd()
    }

    return (
        <span
            ref={wrapperRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span
                onClick={handleClick}
                className={`
          cursor-pointer rounded px-0.5 py-0.5 transition-colors duration-150
          ${isHighlighted || showGloss
                        ? 'bg-amber-100 text-amber-900'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
        `}
            >
                {stripCantillation(word.surface)}
            </span>

            {showGloss && (
                <WordGlossCard
                    word={word}
                    pageOccurrences={pageOccurrences}
                    onClose={() => {
                        setShowGloss(false)
                        onHoverEnd()
                    }}
                />
            )}
        </span>
    )
}