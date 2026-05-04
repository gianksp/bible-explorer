import { useState } from 'react'
import { useAppData } from '../../data/useBibleData.js'
import TooltipCard from '../ui/TooltipCard.jsx'

// Props:
//   activeVersionIds    — string[]
//   showInterlinear     — bool
//   onToggle            — fn(versionId)
//   onToggleInterlinear — fn()

export default function VersionSelector({
    activeVersionIds,
    showInterlinear,
    onToggle,
    onToggleInterlinear,
}) {
    const [hoveredId, setHoveredId] = useState(null)
    const { data: appData } = useAppData()

    const englishVersions = appData?.englishVersions ?? []

    return (
        <div className="space-y-4">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Display
            </div>

            {/* Version pills */}
            <div className="flex flex-wrap gap-2">
                {englishVersions.map(version => {
                    const isActive = activeVersionIds.includes(version.versionId)
                    const isHovered = hoveredId === version.versionId

                    return (
                        <div
                            key={version.versionId}
                            className="relative"
                            onMouseEnter={() => setHoveredId(version.versionId)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <button
                                onClick={() => onToggle(version.versionId)}
                                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer
                  ${isActive
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'}
                `}
                            >
                                {version.fullName}
                            </button>

                            {isHovered && (
                                <TooltipCard position="top">
                                    <div className="px-4 pt-4 pb-3">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                            {version.label} — {version.fullName}
                                        </div>
                                        {version.description && (
                                            <div className="text-[12px] text-gray-400 leading-snug">
                                                {version.description}
                                            </div>
                                        )}
                                    </div>
                                </TooltipCard>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Interlinear toggle */}
            {/* <div
                onClick={onToggleInterlinear}
                className="flex items-center justify-between cursor-pointer group"
            >
                <div>
                    <div className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        Original Languages
                    </div>
                    <div className="text-[11px] text-gray-400 font-serif italic">
                        עברית · Ελληνικά
                    </div>
                </div>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 ${showInterlinear ? 'bg-gray-900' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${showInterlinear ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </div>
            </div> */}
        </div>
    )
}