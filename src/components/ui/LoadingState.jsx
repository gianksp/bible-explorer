// Props:
//   message — string (optional)

export default function LoadingState({ message = 'Loading…' }) {
    return (
        <div className="py-4 text-sm text-gray-400">
            {message}
        </div>
    )
}