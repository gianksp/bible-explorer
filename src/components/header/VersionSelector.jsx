import { useState } from 'react'
import { ENGLISH_VERSIONS } from '../../data/versions.js'
import TooltipCard from '../ui/TooltipCard.jsx'

export default function VersionSelector({ activeVersionIds, onToggle }) {
    const [hoveredId, setHoveredId] = useState(null)

    return (
        <div>
            <div className="text-sm font-medium text-gray-400 mb-4">Select Translations</div>
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
                  px-3 py-1.5 rounded-md text-xs border transition-colors cursor-pointer
                  ${isActive
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
                `}
                            >
                                {version.fullName}
                            </button>

                            {isHovered && (
                                <TooltipCard position="top">
                                    <div className="p-6">
                                        <div className="text-md font-semibold text-gray-900 mb-3">
                                            {version.fullName}
                                        </div>
                                        {version.description && (
                                            <div className="text-sm text-gray-400 leading-snug">
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
        </div>
    )
}
