import { useEffect, useRef, useState } from 'react'
import { decodeMorphology } from '../../data/morphology.js'

export default function WordGlossCard({ word, pageOccurrences, onClose }) {
    const cardRef = useRef(null)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        if (rect.right > window.innerWidth - 16) setFlipped(true)
    }, [])

    const {
        surface,
        transliteration,
        englishGloss,
        strongsNumber,
        morphology,
        definition,
    } = word

    const isHebrew = strongsNumber?.startsWith('H')
    const morphologyText = decodeMorphology(morphology, strongsNumber)

    return (
        <div
            ref={cardRef}
            onClick={e => e.stopPropagation()}
            className={`
        absolute top-full mt-2 z-50 w-72
        bg-white rounded-2xl shadow-2xl border border-gray-100
        ${flipped ? 'right-0' : 'left-0'}
      `}
        >
            <button
                onClick={e => { e.stopPropagation(); onClose() }}
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 text-lg leading-none transition-colors"
            >
                ×
            </button>

            {/* Header — script + transliteration */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div
                    dir={isHebrew ? 'rtl' : 'ltr'}
                    className="font-serif text-2xl text-gray-900 tracking-wide leading-relaxed mb-1"
                >
                    {surface}
                </div>
                {transliteration && (
                    <div className="text-xs text-gray-400 italic tracking-wide">
                        {transliteration}
                    </div>
                )}
            </div>

            {/* Gloss + definition */}
            <div className="px-4 py-3">
                {englishGloss && (
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                        {englishGloss}
                    </div>
                )}
                {definition && (
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                        {definition}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 space-y-2">
                {/* Strong's + raw code */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {strongsNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                        {morphology}
                    </span>
                </div>

                {/* Decoded morphology — plain English */}
                {morphologyText && (
                    <div className="text-[12px] text-gray-600 leading-snug">
                        {morphologyText}
                    </div>
                )}

                {/* Occurrence count */}
                {pageOccurrences > 1 && (
                    <div className="text-[11px] text-blue-500 font-medium pt-1 border-t border-gray-100">
                        Appears {pageOccurrences}× in this chapter
                    </div>
                )}
            </div>
        </div>
    )
}
