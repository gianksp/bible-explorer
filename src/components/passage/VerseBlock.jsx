import InterlinearView from './InterlinearView.jsx'
import ParallelView from './ParallelView.jsx'
import ReaderView from './ReaderView.jsx'

// Props:
//   verse        — single verse object from MOCK_VERSES
//   activeView   — 'interlinear' | 'parallel' | 'reader'
//   selectedWord — word object | null
//   onWordClick  — fn(word)

export default function VerseBlock({
    verse,
    activeView,
    selectedWord,
    onWordClick,
}) {
    const { book, chapter, verse: verseNum, versions } = verse

    return (
        <div className="mb-8">
            <div className="text-[11px] text-gray-400 font-medium mb-2">
                {book} {chapter}:{verseNum}
            </div>

            {activeView === 'interlinear' && (
                <InterlinearView
                    versions={versions}
                    selectedWord={selectedWord}
                    onWordClick={onWordClick}
                />
            )}

            {activeView === 'parallel' && (
                <ParallelView
                    versions={versions}
                    selectedWord={selectedWord}
                />
            )}

            {activeView === 'reader' && (
                <ReaderView
                    verseNum={verseNum}
                    versions={versions}
                />
            )}
        </div>
    )
}