import { CHAPTER_COUNTS } from '../BookNav.jsx'

// Props:
//   book            — string
//   selectedChapter — number
//   onSelectChapter — fn(chapter)
//   onBack          — fn() — goes back to book grid

export default function ChapterGrid({ book, selectedChapter, onSelectChapter, onBack }) {
    const totalChapters = CHAPTER_COUNTS[book] ?? 1
    const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1)

    return (
        <div>
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
            >
                ← {book}
            </button>

            <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5">
                {chapters.map(chapter => (
                    <button
                        key={chapter}
                        onClick={() => onSelectChapter(chapter)}
                        className={`
              py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedChapter === chapter
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'}
            `}
                    >
                        {chapter}
                    </button>
                ))}
            </div>
        </div>
    )
}