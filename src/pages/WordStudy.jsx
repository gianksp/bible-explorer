import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AppHeader from '../components/layout/AppHeader.jsx'
import StrongsCard from '../components/StrongsCard.jsx'
import OccurrenceList from '../components/OccurrenceList.jsx'
import SectionLabel from '../components/ui/SectionLabel.jsx'
import { useVersions, useStrongs, useStrongsOccurrences } from '../data/useBibleData.js'

// Reached via /word/G3056 or /word/H3068
// Shareable URL — apologists can link directly to a word study

const DEFAULT_ACTIVE_VERSIONS = ['KJV', 'ESV', 'GNT']

export default function WordStudy() {
    const { strongsNumber } = useParams()
    const navigate = useNavigate()
    const [activeVersionIds, setActiveVersionIds] = useState(DEFAULT_ACTIVE_VERSIONS)

    const { data: versions } = useVersions()
    const { data: strongsEntry, isLoading: strongsLoading } = useStrongs(strongsNumber)
    const { data: occurrences, isLoading: occurrencesLoading } = useStrongsOccurrences(
        strongsNumber,
        activeVersionIds,
    )

    function handleToggleVersion(versionId) {
        setActiveVersionIds(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    function handleSearch(rawQuery) {
        navigate(`/search?q=${encodeURIComponent(rawQuery)}`)
    }

    function handleSelectVerse({ book, chapter }) {
        navigate(`/?book=${book}&chapter=${chapter}`)
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <AppHeader
                versions={versions}
                activeVersionIds={activeVersionIds}
                searchLoading={false}
                onSearch={handleSearch}
                onToggleVersion={handleToggleVersion}
            />

            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
                <SectionLabel label={`Word study · ${strongsNumber}`} />

                {/* Strong's definition card */}
                <StrongsCard
                    strongsEntry={strongsEntry}
                    isLoading={strongsLoading}
                    error={null}
                />

                {/* All occurrences */}
                <OccurrenceList
                    occurrences={occurrences}
                    isLoading={occurrencesLoading}
                    onSelectVerse={handleSelectVerse}
                />
            </div>
        </div>
    )
}