import InterlinearWord from '../InterlinearWord.jsx'
import VerseRow from '../VerseRow.jsx'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

// Props:
//   versions      — { [versionId]: { text, words? } }
//   selectedWord  — word object | null
//   onWordClick   — fn(word)

export default function InterlinearView({ versions, selectedWord, onWordClick }) {
    const originalEntry = Object.entries(versions).find(
        ([versionId]) => ORIGINAL_VERSION_IDS.includes(versionId)
    )

    const englishEntries = Object.entries(versions).filter(
        ([versionId]) => !ORIGINAL_VERSION_IDS.includes(versionId)
    )

    const highlightTerms = selectedWord ? [selectedWord.englishGloss] : []

    return (
        <>
            {/* Word tiles */}
            {originalEntry && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {originalEntry[1].words?.map(word => (
                        <InterlinearWord
                            key={word.wordId}
                            word={word}
                            isSelected={selectedWord?.wordId === word.wordId}
                            onWordClick={onWordClick}
                        />
                    )) ?? (
                            <span className="text-sm font-serif text-gray-700">
                                {originalEntry[1].text}
                            </span>
                        )}
                </div>
            )}

            {/* English versions below */}
            <div className="border-t border-gray-100 pt-3 space-y-1">
                {englishEntries.map(([versionId, versionData]) => (
                    <VerseRow
                        key={versionId}
                        versionId={versionId}
                        versionLabel={versionId}
                        text={versionData.text}
                        highlightTerms={highlightTerms}
                        isOriginal={false}
                    />
                ))}
            </div>
        </>
    )
}