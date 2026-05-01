// Props:
//   message — string

export default function ErrorState({ message }) {
    return (
        <div className="py-4 text-sm text-red-500">
            {message}
        </div>
    )
}