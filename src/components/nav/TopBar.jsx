// Props:
//   label          — string — what to show (e.g. "Genesis 1", "sons of god", "Search")
//   versionId      — string
//   activeMode     — 'reader' | 'verse'
//   onOpenDropdown — fn()
//   onSelectMode   — fn(mode)

export default function TopBar({
    label,
    versionId,
    activeMode,
    onOpenDropdown,
    onSelectMode,
}) {
    return (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
            {/* Left spacer to balance the right toggle */}
            <div className="w-[120px] shrink-0" />

            {/* Centered label + version */}
            <button
                onClick={onOpenDropdown}
                className="flex items-center gap-1.5 group"
            >
                <span className="text-sm font-medium text-gray-900 group-hover:text-gray-500 transition-colors truncate max-w-[180px] md:max-w-sm">
                    {label}
                </span>
                {versionId && (
                    <span className="text-sm text-gray-400 group-hover:text-gray-500 transition-colors shrink-0">
                        {versionId}
                    </span>
                )}
                <span className="text-gray-300 text-xs shrink-0">▾</span>
            </button>

            {/* Mode toggle — right side */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0 w-[120px] justify-end">
                {[
                    { modeId: 'reader', label: 'Reader' },
                    { modeId: 'verse', label: 'Verse' },
                ].map(({ modeId, label: modeLabel }) => (
                    <button
                        key={modeId}
                        onClick={() => onSelectMode(modeId)}
                        className={`
              px-3 py-1.5 text-xs font-medium transition-colors
              ${activeMode === modeId
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'}
            `}
                    >
                        {modeLabel}
                    </button>
                ))}
            </div>
        </div>
    )
}
