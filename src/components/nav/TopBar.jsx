// Props:
//   label            — string
//   versionId        — string
//   dropdownOpen     — bool
//   onToggleDropdown — fn()

const CHEVRON = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="-mr-1 size-5 text-gray-300" style={{ transition: 'transform 300ms' }}>
        <path fillRule="evenodd" clipRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
    </svg>
)

export default function TopBar({
    label,
    versionId,
    dropdownOpen,
    onToggleDropdown,
}) {
    return (
        <div className="flex items-center justify-center px-5 py-3 border-b border-gray-100 shrink-0 relative z-50 bg-white">
            <button
                onClick={onToggleDropdown}
                className="flex items-center gap-1.5 group cursor-pointer"
            >
                <span className="text-md font-medium text-gray-900 group-hover:text-gray-500 transition-colors truncate max-w-[200px] md:max-w-sm">
                    {label}
                </span>
                {versionId && (
                    <span className="text-md text-gray-400 group-hover:text-gray-500 transition-colors shrink-0">
                        {versionId}
                    </span>
                )}
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="-mr-1 size-5 text-gray-300"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms' }}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
            </button>
        </div>
    )
}
