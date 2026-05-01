// Props:
//   label — string

export default function SectionLabel({ label }) {
    return (
        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
            {label}
        </div>
    )
}