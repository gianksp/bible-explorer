import SearchBar from '../SearchBar.jsx'
import VersionPicker from '../VersionPicker.jsx'

// Props:
//   versions         — MOCK_VERSIONS[]
//   activeVersionIds — string[]
//   searchLoading    — bool
//   onSearch         — fn(rawQuery)
//   onToggleVersion  — fn(versionId)

export default function AppHeader({
    versions,
    activeVersionIds,
    searchLoading,
    onSearch,
    onToggleVersion,
}) {
    return (
        <header className="flex flex-col gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
            <SearchBar
                onSearch={onSearch}
                isLoading={searchLoading}
            />
            {versions && (
                <VersionPicker
                    versions={versions}
                    activeVersionIds={activeVersionIds}
                    onToggle={onToggleVersion}
                />
            )}
        </header>
    )
}