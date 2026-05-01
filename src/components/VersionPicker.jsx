// Props:
//   versions        — MOCK_VERSIONS[]
//   activeVersionIds — string[]
//   onToggle        — fn(versionId: string) toggles a version on/off

export default function VersionPicker({ versions, activeVersionIds, onToggle }) {
    const originalVersions = versions.filter(v => v.isOriginal)
    const englishVersions = versions.filter(v => !v.isOriginal)

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            {/* Original languages first */}
            {originalVersions.map(version => (
                <VersionPill
                    key={version.versionId}
                    version={version}
                    isActive={activeVersionIds.includes(version.versionId)}
                    onToggle={onToggle}
                    isOriginal
                />
            ))}

            {/* Divider */}
            <div className="w-px h-4 bg-gray-200 mx-0.5" />

            {/* English translations */}
            {englishVersions.map(version => (
                <VersionPill
                    key={version.versionId}
                    version={version}
                    isActive={activeVersionIds.includes(version.versionId)}
                    onToggle={onToggle}
                    isOriginal={false}
                />
            ))}
        </div>
    )
}

function VersionPill({ version, isActive, onToggle, isOriginal }) {
    const { versionId, label } = version

    const activeClass = isOriginal
        ? 'bg-purple-50 text-purple-800 border-purple-300'
        : 'bg-blue-50 text-blue-800 border-blue-300'

    const inactiveClass = 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'

    return (
        <button
            onClick={() => onToggle(versionId)}
            className={`
        text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors
        ${isActive ? activeClass : inactiveClass}
      `}
        >
            {label}
        </button>
    )
}