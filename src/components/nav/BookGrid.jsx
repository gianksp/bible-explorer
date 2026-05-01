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

// Props:
//   selectedBook  — string | null
//   onSelectBook  — fn(book)

export default function BookGrid({ selectedBook, onSelectBook }) {
    return (
        <div className="overflow-y-auto">
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
    )
}

function BookSection({ label, books, selectedBook, onSelectBook }) {
    return (
        <div className="mb-4">
            <div className="px-1 py-2 text-[10px] uppercase tracking-widest text-gray-400">
                {label}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                {books.map(book => (
                    <button
                        key={book}
                        onClick={() => onSelectBook(book)}
                        className={`
              text-left px-3 py-2 rounded-lg text-sm transition-colors truncate
              ${selectedBook === book
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'}
            `}
                    >
                        {book}
                    </button>
                ))}
            </div>
        </div>
    )
}