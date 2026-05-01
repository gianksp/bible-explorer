import { SECTION_HEADINGS } from '../../data/mockVerses.js'

// Props:
//   verses      — MOCK_VERSES[]
//   versionId   — string

export default function ReaderView({ verses, versionId }) {
    if (!verses?.length) return null

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            {verses.map((verse, index) => {
                const { verseId, verse: verseNum, versions } = verse
                const text = versions[versionId]?.text ?? ''
                const heading = SECTION_HEADINGS[verseId]

                return (
                    <span key={verseId}>
                        {/* Section heading */}
                        {heading && (
                            <h2 className="block text-base font-semibold text-gray-800 mt-8 mb-3 clear-both">
                                {heading}
                            </h2>
                        )}

                        {/* Verse number superscript + text inline */}
                        <sup className="text-[10px] text-gray-400 mr-0.5 select-none font-normal">
                            {verseNum}
                        </sup>
                        <span className="text-gray-800 leading-8 text-[17px]">
                            {text}{' '}
                        </span>
                    </span>
                )
            })}
        </div>
    )
}