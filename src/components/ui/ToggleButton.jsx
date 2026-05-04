export const DropdownToggleButton = ({ title, onToggle, isActive }) => {
    return (
        < div className="flex items-center justify-between" >
            <div>
                <div className="text-sm font-medium text-gray-400">{title}</div>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer
                    ${isActive ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                    ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div >
    )
}