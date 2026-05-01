import VerseRow from '../VerseRow.jsx'

const ORIGINAL_VERSION_IDS = ['GNT', 'WLC', 'LXX']

// Props:
//   versions      — { [versionId]: { text, words? } }
//   selectedWord  — word object | null

export default function ParallelView({ versions, selectedWord }) {
    const highlightTerms = selectedWord ? [selectedWord.englishGloss] : []

    return (
        <div className="space-y-1">
            {Object.entries(versions).map(([versionId, versionData]) => (
                <VerseRow
                    key={versionId}
                    versionId={versionId}
                    versionLabel={versionId}
                    text={versionData.text}
                    highlightTerms={highlightTerms}
                    isOriginal={ORIGINAL_VERSION_IDS.includes(versionId)}
                />
            ))}
        </div>
    )
}