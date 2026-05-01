// Props:
//   book    — string
//   chapter — number
//   verse   — number (optional — omit for chapter-level ref)
//   onClick — fn() optional

export default function VerseReference({ book, chapter, verse, onClick }) {
    const refText = verse
        ? `${book} ${chapter}:${verse}`
        : `${book} ${chapter}`

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="text-xs font-medium text-blue-600 hover:underline text-left"
            >
                {refText}
            </button>
        )
    }

    return (
        <span className="text-xs font-medium text-gray-700">
            {refText}
        </span>
    )
}