import { useState, useEffect, useMemo } from 'react'
import { bibleApi } from '../../data/bibleApi.js'

// book_id → display name
const BOOK_ID_TO_NAME = {
    genesis: 'Genesis', exodus: 'Exodus', leviticus: 'Leviticus', numbers: 'Numbers',
    deuteronomy: 'Deuteronomy', joshua: 'Joshua', judges: 'Judges', ruth: 'Ruth',
    '1samuel': '1 Samuel', '2samuel': '2 Samuel', '1kings': '1 Kings', '2kings': '2 Kings',
    '1chronicles': '1 Chronicles', '2chronicles': '2 Chronicles', ezra: 'Ezra', nehemiah: 'Nehemiah',
    esther: 'Esther', job: 'Job', psalms: 'Psalms', proverbs: 'Proverbs',
    ecclesiastes: 'Ecclesiastes', songofsolomon: 'Song of Solomon', isaiah: 'Isaiah',
    jeremiah: 'Jeremiah', lamentations: 'Lamentations', ezekiel: 'Ezekiel', daniel: 'Daniel',
    hosea: 'Hosea', joel: 'Joel', amos: 'Amos', obadiah: 'Obadiah',
    jonah: 'Jonah', micah: 'Micah', nahum: 'Nahum', habakkuk: 'Habakkuk',
    zephaniah: 'Zephaniah', haggai: 'Haggai', zechariah: 'Zechariah', malachi: 'Malachi',
    // Apocrypha
    tobit: 'Tobit', judith: 'Judith', '1maccabees': '1 Maccabees', '2maccabees': '2 Maccabees',
    wisdom: 'Wisdom', sirach: 'Sirach', baruch: 'Baruch', '1esdras': '1 Esdras',
    '2esdras': '2 Esdras', prayerofmanasses: 'Prayer of Manasses',
    // NT
    matthew: 'Matthew', mark: 'Mark', luke: 'Luke', john: 'John',
    acts: 'Acts', romans: 'Romans', '1corinthians': '1 Corinthians', '2corinthians': '2 Corinthians',
    galatians: 'Galatians', ephesians: 'Ephesians', philippians: 'Philippians', colossians: 'Colossians',
    '1thessalonians': '1 Thessalonians', '2thessalonians': '2 Thessalonians',
    '1timothy': '1 Timothy', '2timothy': '2 Timothy', titus: 'Titus', philemon: 'Philemon',
    hebrews: 'Hebrews', james: 'James', '1peter': '1 Peter', '2peter': '2 Peter',
    '1john': '1 John', '2john': '2 John', '3john': '3 John', jude: 'Jude', revelation: 'Revelation',
}

// Canonical order for grouping
const OT_ORDER = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth',
    '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah',
    'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'songofsolomon', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah',
    'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi',
]

const APOCRYPHA_ORDER = [
    '1esdras', '2esdras', 'tobit', 'judith', 'wisdom', 'sirach', 'baruch',
    'prayerofmanasses', '1maccabees', '2maccabees',
]

const NT_ORDER = [
    'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
    '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians',
    '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon',
    'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude', 'revelation',
]

// Props:
//   selectedBook    — string (display name)
//   activeVersionIds — string[]
//   onSelectBook    — fn(displayName)

export default function BookGrid({ selectedBook, activeVersionIds = [], onSelectBook }) {
    const [bookIds, setBookIds] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch books for all selected versions in parallel, union the results
    useEffect(() => {
        console.log('BookGrid effect:', activeVersionIds)  // ← add this
        if (!activeVersionIds.length) return

        const englishIds = activeVersionIds.filter(id => !['GNT', 'WLC', 'LXX'].includes(id))
        const bibles = englishIds.length ? englishIds : activeVersionIds

        setLoading(true)
        Promise.all(
            bibles.map(id => bibleApi.listBooks(id.toLowerCase()).catch(() => []))
        ).then(results => {
            const union = new Set()
            results.forEach(books => books.forEach(b => union.add(b.book_id)))
            setBookIds(union)
            setLoading(false)
        })
    }, [JSON.stringify(activeVersionIds)])

    const { otBooks, apocBooks, ntBooks } = useMemo(() => {
        if (!bookIds) return { otBooks: [], apocBooks: [], ntBooks: [] }
        return {
            otBooks: OT_ORDER.filter(id => bookIds.has(id)),
            apocBooks: APOCRYPHA_ORDER.filter(id => bookIds.has(id)),
            ntBooks: NT_ORDER.filter(id => bookIds.has(id)),
        }
    }, [bookIds])

    if (loading) return (
        <div className="text-sm text-gray-400 py-4">Loading books…</div>
    )

    return (
        <div className="overflow-y-auto">
            {otBooks.length > 0 && (
                <BookSection
                    label="Old Testament"
                    bookIds={otBooks}
                    selectedBook={selectedBook}
                    onSelectBook={onSelectBook}
                />
            )}
            {apocBooks.length > 0 && (
                <BookSection
                    label="Deuterocanonical"
                    bookIds={apocBooks}
                    selectedBook={selectedBook}
                    onSelectBook={onSelectBook}
                />
            )}
            {ntBooks.length > 0 && (
                <BookSection
                    label="New Testament"
                    bookIds={ntBooks}
                    selectedBook={selectedBook}
                    onSelectBook={onSelectBook}
                />
            )}
        </div>
    )
}

function BookSection({ label, bookIds, selectedBook, onSelectBook }) {
    return (
        <div className="mb-4">
            <div className="text-sm font-medium text-gray-400 mb-4">{label}</div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                {bookIds.map(id => {
                    const name = BOOK_ID_TO_NAME[id] ?? id
                    const isActive = selectedBook === name
                    return (
                        <button
                            key={id}
                            onClick={() => onSelectBook(name)}
                            className={`
                text-left px-3 py-2 rounded-lg text-sm transition-colors truncate cursor-pointer
                ${isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'}
              `}
                        >
                            {name}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}