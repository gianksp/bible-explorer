export default function InterlinearWord({ word, isSelected, onWordClick }) {
    const { surface, transliteration, englishGloss, strongsNumber, morphology } = word
    const isHebrew = strongsNumber?.startsWith('H')

    return (
        <button
            onClick={() => onWordClick(word)}
            title={morphology}
            className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-pointer
        min-w-[58px] text-center transition-colors
        ${isSelected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-transparent hover:border-blue-300 hover:bg-blue-50'}
      `}
        >
            <span className={`text-lg leading-snug font-serif ${isHebrew ? 'dir-rtl' : ''}`}>
                {surface}
            </span>
            <span className="text-[10px] text-gray-400">
                {transliteration}
            </span>
            <span className="text-[11px] text-blue-700 font-medium">
                {englishGloss}
            </span>
            <span className="text-[10px] text-gray-400">
                {strongsNumber}
            </span>
        </button>
    )
}