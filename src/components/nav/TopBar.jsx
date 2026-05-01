// Props:
//   book           — string
//   chapter        — number
//   versionId      — string
//   activeMode     — 'reader' | 'verse'
//   onOpenDropdown — fn()
//   onSelectMode   — fn(mode)

export default function TopBar({
    book,
    chapter,
    versionId,
    activeMode,
    onOpenDropdown,
    onSelectMode,
}) {
    const passageLabel = `${book} ${chapter}`

    return (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
            <div className="flex" />
            <button
                onClick={onOpenDropdown}
                className="flex items-center gap-2 group"
            >
                <span className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                    {passageLabel}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                    {versionId}
                </span>
                <span className="text-gray-300 text-sm">▾</span>
            </button>

            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {[
                    { modeId: 'reader', label: 'Reader' },
                    { modeId: 'verse', label: 'Verse' },
                ].map(({ modeId, label }) => (
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
                        {label}
                    </button>
                ))}
            </div>
        </div>
    )
}
