// Props:
//   activeView  — 'interlinear' | 'parallel' | 'reader'
//   onSelect    — fn(view: string)

const VIEWS = [
    { viewId: 'interlinear', label: 'Interlinear' },
    { viewId: 'parallel', label: 'Parallel' },
    { viewId: 'reader', label: 'Reader' },
]

export default function ViewToggle({ activeView, onSelect }) {
    return (
        <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
            {VIEWS.map(({ viewId, label }) => (
                <button
                    key={viewId}
                    onClick={() => onSelect(viewId)}
                    className={`
            px-3 py-1.5 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0
            ${activeView === viewId
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-white text-gray-500 hover:bg-gray-50'}
          `}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}