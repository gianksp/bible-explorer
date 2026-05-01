import { CHAPTER_COUNTS } from '../BookNav.jsx'

// Props:
//   book            — string
//   chapter         — number
//   onPrevChapter   — fn()
//   onNextChapter   — fn()

export default function ChapterNav({
    book,
    chapter,
    onPrevChapter,
    onNextChapter,
}) {
    const totalChapters = CHAPTER_COUNTS[book] ?? 1
    const isFirst = chapter <= 1
    const isLast = chapter >= totalChapters

    return (
        <div className="flex items-center gap-2 shrink-0">
            <button
                onClick={onPrevChapter}
                disabled={isFirst}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous chapter"
            >
                ←
            </button>

            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                {book} {chapter}
            </span>

            <button
                onClick={onNextChapter}
                disabled={isLast}
                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next chapter"
            >
                →
            </button>
        </div>
    )
} 