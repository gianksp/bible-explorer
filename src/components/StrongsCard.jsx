import MorphTag from './MorphTag.jsx'
import LoadingState from './ui/LoadingState.jsx'
import ErrorState from './ui/ErrorState.jsx'
import EmptyState from './ui/EmptyState.jsx'

export default function StrongsCard({ strongsEntry, isLoading, error }) {
    if (isLoading) return <LoadingState />
    if (error) return <ErrorState message={error} />
    if (!strongsEntry) return <EmptyState message="Tap a word to see its definition" />

    const {
        strongsNumber,
        surface,
        transliteration,
        language,
        definition,
        morphologyBreakdown,
        occurrenceCount,
    } = strongsEntry

    const isHebrew = language === 'hebrew'

    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-[11px] text-blue-700 font-medium mb-1">
                {strongsNumber}
            </div>
            <div className={`text-2xl font-serif leading-snug mb-1 ${isHebrew ? 'direction-rtl' : ''}`}>
                {surface}
            </div>
            <div className="text-xs text-gray-500 mb-3">
                {transliteration} · {language}
            </div>
            <div className="text-sm leading-relaxed mb-3">
                {definition}
            </div>
            <div className="mb-3">
                {morphologyBreakdown.map(({ tag, label }) => (
                    <MorphTag key={tag} tag={tag} label={label} />
                ))}
            </div>
            <div className="text-[11px] text-gray-400">
                {occurrenceCount.toLocaleString()} occurrences in {isHebrew ? 'OT' : 'NT'}
            </div>
        </div>
    )
}