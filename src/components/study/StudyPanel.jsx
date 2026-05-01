import StrongsCard from '../StrongsCard.jsx'
import OccurrenceList from '../OccurrenceList.jsx'

const PANEL_TABS = [
    { tabId: 'word-study', label: 'Word study' },
    { tabId: 'cross-refs', label: 'Cross-refs' },
    { tabId: 'notes', label: 'Notes' },
]

// Props:
//   activePanelTab       — string
//   strongsEntry         — MOCK_STRONGS entry | null
//   strongsLoading       — bool
//   occurrences          — MOCK_SEARCH_RESULTS[]
//   occurrencesLoading   — bool
//   onSelectPanelTab     — fn(tabId)
//   onSelectVerse        — fn({ book, chapter, verse })

export default function StudyPanel({
    activePanelTab,
    strongsEntry,
    strongsLoading,
    occurrences,
    occurrencesLoading,
    onSelectPanelTab,
    onSelectVerse,
}) {
    return (
        <div className="flex flex-col h-full border-l border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
                {PANEL_TABS.map(({ tabId, label }) => (
                    <button
                        key={tabId}
                        onClick={() => onSelectPanelTab(tabId)}
                        className={`
              flex-1 py-2.5 text-xs font-medium transition-colors border-b-2
              ${activePanelTab === tabId
                                ? 'text-blue-600 border-blue-500'
                                : 'text-gray-400 border-transparent hover:text-gray-600'}
            `}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
                {activePanelTab === 'word-study' && (
                    <>
                        <StrongsCard
                            strongsEntry={strongsEntry}
                            isLoading={strongsLoading}
                            error={null}
                        />
                        <OccurrenceList
                            occurrences={occurrences}
                            isLoading={occurrencesLoading}
                            onSelectVerse={onSelectVerse}
                        />
                    </>
                )}
                {activePanelTab === 'cross-refs' && (
                    <div className="text-sm text-gray-400">Cross-references coming soon</div>
                )}
                {activePanelTab === 'notes' && (
                    <div className="text-sm text-gray-400">Notes coming soon</div>
                )}
            </div>
        </div>
    )
}