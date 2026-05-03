import { useState } from 'react'
import { ENGLISH_VERSIONS } from '../../data/versions.js'
import TooltipCard from '../ui/TooltipCard.jsx'

// Props:
//   activeVersionIds — string[]
//   onToggle         — fn(versionId)

export default function VersionSelector({ activeVersionIds, onToggle }) {
    const [hoveredId, setHoveredId] = useState(null)

    return (
        <div>
            <div className="text-md font-medium text-gray-700 mb-2">Translation</div>
            <div className="flex flex-wrap gap-2">
                {ENGLISH_VERSIONS.map(version => {
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
                  px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                  ${isActive
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                `}
                            >
                                {version.label}
                            </button>

                            {isHovered && (
                                <TooltipCard position="top">
                                    <div className="px-4 pt-4 pb-3">
                                        <div className="text-sm font-semibold text-gray-900 mb-1">
                                            {version.label}
                                        </div>
                                        <div className="text-[13px] text-gray-500 leading-relaxed mb-1">
                                            {version.fullName}
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
            {activeVersionIds.length > 1 && (
                <p className="text-[11px] text-gray-400 mt-2">
                    {activeVersionIds.length} translations — shown in parallel
                </p>
            )}
        </div>
    )
}
