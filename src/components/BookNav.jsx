// Props:
//   selectedBook   — string e.g. 'John'
//   selectedChapter — number
//   onSelectBook   — fn(book: string)
//   onSelectChapter — fn(chapter: number)

const OLD_TESTAMENT_BOOKS = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
    'Haggai', 'Zechariah', 'Malachi',
]

const NEW_TESTAMENT_BOOKS = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
    'Titus', 'Philemon', 'Hebrews', 'James',
    '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation',
]

// Chapter counts per book — used to render chapter picker
export const CHAPTER_COUNTS = {
    Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
    Joshua: 24, Judges: 21, Ruth: 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
    Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
    Ecclesiastes: 12, 'Song of Solomon': 8, Isaiah: 66, Jeremiah: 52,
    Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
    Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
    Haggai: 2, Zechariah: 14, Malachi: 4,
    Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
    Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13, Galatians: 6,
    Ephesians: 6, Philippians: 4, Colossians: 4,
    '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
    Titus: 3, Philemon: 1, Hebrews: 13, James: 5,
    '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
    Jude: 1, Revelation: 22,
}

export default function BookNav({
    selectedBook,
    selectedChapter,
    onSelectBook,
    onSelectChapter,
}) {
    const chapterCount = selectedBook ? CHAPTER_COUNTS[selectedBook] ?? 1 : 0
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Book list */}
            <div className="flex-1 overflow-y-auto">
                <BookSection
                    label="Old Testament"
                    books={OLD_TESTAMENT_BOOKS}
                    selectedBook={selectedBook}
                    onSelectBook={onSelectBook}
                />
                <BookSection
                    label="New Testament"
                    books={NEW_TESTAMENT_BOOKS}
                    selectedBook={selectedBook}
                    onSelectBook={onSelectBook}
                />
            </div>

            {/* Chapter picker — only shown when a book is selected */}
            {selectedBook && (
                <div className="border-t border-gray-100 p-2">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 px-1">
                        {selectedBook}
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                        {chapters.map(chapter => (
                            <button
                                key={chapter}
                                onClick={() => onSelectChapter(chapter)}
                                className={`
                  text-xs py-1 rounded transition-colors
                  ${selectedChapter === chapter
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'}
                `}
                            >
                                {chapter}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function BookSection({ label, books, selectedBook, onSelectBook }) {
    return (
        <div className="mb-2">
            <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-gray-400 sticky top-0 bg-white">
                {label}
            </div>
            {books.map(book => (
                <button
                    key={book}
                    onClick={() => onSelectBook(book)}
                    className={`
            w-full text-left px-3 py-1.5 text-sm transition-colors
            ${selectedBook === book
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'}
          `}
                >
                    {book}
                </button>
            ))}
        </div>
    )
}