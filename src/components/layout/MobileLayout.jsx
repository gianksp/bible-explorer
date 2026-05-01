const MOBILE_TABS = [
    { tabId: 'nav', label: 'Books' },
    { tabId: 'passage', label: 'Passage' },
    { tabId: 'study', label: 'Study' },
]

// Props:
//   activeMobileTab    — string
//   onSelectMobileTab  — fn(tabId)
//   navPanel           — ReactNode
//   passagePanel       — ReactNode
//   studyPanel         — ReactNode

export default function MobileLayout({
    activeMobileTab,
    onSelectMobileTab,
    navPanel,
    passagePanel,
    studyPanel,
}) {
    return (
        <div className="flex flex-col h-full md:hidden">
            <div className="flex-1 overflow-hidden">
                {activeMobileTab === 'nav' && navPanel}
                {activeMobileTab === 'passage' && passagePanel}
                {activeMobileTab === 'study' && studyPanel}
            </div>

            <nav className="flex border-t border-gray-100 shrink-0 bg-white">
                {MOBILE_TABS.map(({ tabId, label }) => (
                    <button
                        key={tabId}
                        onClick={() => onSelectMobileTab(tabId)}
                        className={`
              flex-1 py-3 text-xs font-medium transition-colors
              ${activeMobileTab === tabId
                                ? 'text-blue-600 border-t-2 border-blue-500 -mt-px'
                                : 'text-gray-400'}
            `}
                    >
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    )
}