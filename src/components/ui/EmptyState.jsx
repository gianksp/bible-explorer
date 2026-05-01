// Props:
//   message — string

export default function EmptyState({ message }) {
    return (
        <div className="py-4 text-sm text-gray-400">
            {message}
        </div>
    )
}