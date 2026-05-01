import { MOCK_VERSIONS } from '../../data/mockVerses.js'

// Only English translations — originals always shown automatically in verse view
// Props:
//   activeVersionId — string
//   onSelect        — fn(versionId)

export default function VersionSelector({ activeVersionId, onSelect }) {
    const englishVersions = MOCK_VERSIONS.filter(v => !v.isOriginal)

    return (
        <div className="mt-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                Translation
            </div>
            <div className="flex flex-wrap gap-2">
                {englishVersions.map(version => (
                    <button
                        key={version.versionId}
                        onClick={() => onSelect(version.versionId)}
                        className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${activeVersionId === version.versionId
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
            `}
                    >
                        {version.label}
                    </button>
                ))}
            </div>
        </div>
    )
}