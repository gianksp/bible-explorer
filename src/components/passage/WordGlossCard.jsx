import { useEffect, useRef, useState } from 'react'
import { stripCantillation } from '../../utils/parser'

export default function WordGlossCard({ word, pageOccurrences, onClose }) {
    const cardRef = useRef(null)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        if (rect.right > window.innerWidth - 16) setFlipped(true)
    }, [])

    const {
        englishGloss,
        surface,
        transliteration,
        strongsNumber,
        morphology,
        definition,
    } = word

    return (
        <div
            ref={cardRef}
            className={`
        absolute top-full mt-2 z-50 w-72
        bg-white border border-gray-200 rounded-2xl shadow-xl p-4
        ${flipped ? 'right-0' : 'left-0'}
      `}
        >
            <button
                onClick={e => { e.stopPropagation(); onClose() }}
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-600 text-xl leading-none"
            >
                ×
            </button>

            {/* English → Original */}
            <div className="flex items-baseline flex-wrap gap-1.5 mb-3 pr-6">
                <span className="text-base font-serif text-gray-800">{stripCantillation(surface)}</span>
                <span className="text-gray-300 text-xs mx-1">→</span>
                <span className="text-sm font-semibold text-blue-700">{englishGloss}</span>
                <span className="text-xs text-gray-400 italic">{transliteration}</span>
            </div>

            {/* Definition */}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {definition}
            </p>

            {/* Strong's + morphology */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {strongsNumber}
                </span>
                <span className="text-[11px] text-gray-400">
                    {morphology}
                </span>
            </div>

            {pageOccurrences > 1 && (
                <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                    Appears {pageOccurrences}× in this chapter
                </div>
            )}
        </div>
    )
}