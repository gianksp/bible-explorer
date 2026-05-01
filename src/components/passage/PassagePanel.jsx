import ViewToggle from '../ViewToggle.jsx'
import ChapterNav from './ChapterNav.jsx'
import VerseBlock from './VerseBlock.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'

// Props:
//   book          — string
//   chapter       — number
//   verses        — MOCK_VERSES[]
//   isLoading     — bool
//   error         — string | null
//   activeView    — string
//   selectedWord  — word object | null
//   onViewSelect  — fn(view)
//   onWordClick   — fn(word)
//   onPrevChapter — fn()
//   onNextChapter — fn()

export default function PassagePanel({
    book,
    chapter,
    verses,
    isLoading,
    error,
    activeView,
    selectedWord,
    onViewSelect,
    onWordClick,
    onPrevChapter,
    onNextChapter,
}) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Topbar — chapter nav + view toggle */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
                <ChapterNav
                    book={book}
                    chapter={chapter}
                    onPrevChapter={onPrevChapter}
                    onNextChapter={onNextChapter}
                />
                <ViewToggle
                    activeView={activeView}
                    onSelect={onViewSelect}
                />
            </div>

            {/* Scrollable verses */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                {isLoading && <LoadingState />}
                {error && <ErrorState message={error} />}
                {verses?.map(verse => (
                    <VerseBlock
                        key={verse.verseId}
                        verse={verse}
                        activeView={activeView}
                        selectedWord={selectedWord}
                        onWordClick={onWordClick}
                    />
                ))}
            </div>
        </div>
    )
}