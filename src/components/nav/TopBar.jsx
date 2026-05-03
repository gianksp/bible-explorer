const MODES = [
    {
        modeId: 'reader',
        label: 'Reader',
        icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <rect x="1" y="2" width="14" height="1.5" rx="0.75" />
                <rect x="1" y="5.5" width="14" height="1.5" rx="0.75" />
                <rect x="1" y="9" width="14" height="1.5" rx="0.75" />
                <rect x="1" y="12.5" width="9" height="1.5" rx="0.75" />
            </svg>
        ),
    },
    {
        modeId: 'verse',
        label: 'Verse',
        icon: (
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <rect x="4" y="2" width="10" height="1.5" rx="0.75" />
                <rect x="4" y="7" width="10" height="1.5" rx="0.75" />
                <rect x="4" y="12" width="10" height="1.5" rx="0.75" />
                <circle cx="1.75" cy="2.75" r="0.75" />
                <circle cx="1.75" cy="7.75" r="0.75" />
                <circle cx="1.75" cy="12.75" r="0.75" />
            </svg>
        ),
    },
]

// Props:
//   label          — string
//   versionId      — string
//   activeMode     — 'reader' | 'verse'
//   dropdownOpen   — bool
//   onToggleDropdown — fn()
//   onSelectMode   — fn(mode)

export default function TopBar({
    label,
    versionId,
    activeMode,
    dropdownOpen,
    onToggleDropdown,
    onSelectMode,
}) {
    return (
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0 relative z-50 bg-white">
            {/* Left spacer */}
            <div className="w-[72px] md:w-[112px] shrink-0" />

            {/* Centered label — toggles dropdown */}
            <button
                onClick={onToggleDropdown}
                className="flex items-center gap-1.5 group cursor-pointer"
            >
                <span className="text-md font-medium text-gray-900 group-hover:text-gray-500 transition-colors truncate max-w-[140px] md:max-w-sm">
                    {label}
                </span>
                {versionId && (
                    <span className="text-md text-gray-400 group-hover:text-gray-500 transition-colors shrink-0">
                        {versionId}
                    </span>
                )}
                {/* Chevron rotates when open */}
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`-mr-1 size-5 text-gray-300 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
            </button>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0 w-[72px] md:w-[112px]">
                {MODES.map(({ modeId, label: modeLabel, icon }) => (
                    <button
                        key={modeId}
                        onClick={() => onSelectMode(modeId)}
                        title={modeLabel}
                        className={`
              flex-1 flex items-center justify-center
              py-1.5 transition-colors cursor-pointer
              ${activeMode === modeId
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-500 hover:bg-gray-50'}
            `}
                    >
                        <span className="md:hidden">{icon}</span>
                        <span className="hidden md:inline text-xs font-medium">{modeLabel}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
