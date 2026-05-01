export default function MorphTag({ tag, label }) {
    return (
        <span className="inline-block text-[10px] px-2 py-0.5 bg-purple-50 text-purple-800 rounded mr-1 mb-1">
            {label ?? tag}
        </span>
    )
}