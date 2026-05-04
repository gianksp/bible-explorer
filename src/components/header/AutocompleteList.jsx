import { useDailyReadings } from '../../data/useBibleData.js'

export default function AutocompleteList({ query, onSelect, onLoadAll }) {
    const { data: daily, isLoading } = useDailyReadings()

    const massReadings = daily?.suggestions ?? []

    const q = query.trim().toLowerCase()
    const filtered = q
        ? massReadings.filter(s =>
            s.label.toLowerCase().includes(q) ||
            s.query.toLowerCase().includes(q)
        )
        : massReadings

    function handleLoadAll() {
        if (!massReadings.length) return
        const combined = massReadings.map(r => r.query).join('; ')
        onLoadAll(combined)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">
                    Today's Mass Readings
                </span>
                {!isLoading && massReadings.length > 0 && (
                    <button
                        onClick={handleLoadAll}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                    >
                        View All
                    </button>
                )}
            </div>

            {/* List */}
            {filtered.length > 0 ? (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                    {filtered.map((reading, i) => {
                        const parts = reading.label.split(' · ')
                        const typePart = parts[0]
                        const refPart = parts[1] ?? reading.query

                        return (
                            <button
                                key={i}
                                onClick={() => onSelect(reading)}
                                className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0 group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded shrink-0">
                                        {typePart}
                                    </span>
                                    <span className="text-sm text-gray-600 truncate">{refPart}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            ) : !isLoading ? (
                <div className="py-4 text-center text-sm text-gray-400">
                    No readings available today
                </div>
            ) : null}
        </div>
    )
}