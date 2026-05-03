import { decodeMorphology } from '../../data/morphology.js'
import TooltipCard from '../ui/TooltipCard.jsx'

export default function WordGlossCard({ word, pageOccurrences, onClose }) {
    const {
        surface, transliteration, englishGloss,
        strongsNumber, morphology, definition,
    } = word

    const isHebrew = strongsNumber?.startsWith('H')
    const morphologyText = decodeMorphology(morphology, strongsNumber)

    return (
        <TooltipCard onClose={onClose}>
            {/* Header */}
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
                    <div className="text-sm font-semibold text-gray-900 mb-2">{englishGloss}</div>
                )}
                {definition && (
                    <p className="text-[13px] text-gray-500 leading-relaxed">{definition}</p>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {strongsNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{morphology}</span>
                </div>
                {morphologyText && (
                    <div className="text-[12px] text-gray-600 leading-snug">{morphologyText}</div>
                )}
                {pageOccurrences > 1 && (
                    <div className="text-[11px] text-blue-500 font-medium pt-1 border-t border-gray-100">
                        Appears {pageOccurrences}× in this chapter
                    </div>
                )}
            </div>
        </TooltipCard>
    )
}
