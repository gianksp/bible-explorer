import { useEffect, useRef, useState } from 'react'

// Generic tooltip card — same visual style as WordGlossCard
// Appears above or below anchor, flips if near screen edge
//
// Props:
//   children  — content to render inside
//   onClose   — fn() optional close button
//   position  — 'top' | 'bottom' (default: 'bottom')

export default function TooltipCard({ children, onClose, position = 'bottom' }) {
    const cardRef = useRef(null)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        if (rect.right > window.innerWidth - 16) setFlipped(true)
    }, [])

    return (
        <div
            ref={cardRef}
            onClick={e => e.stopPropagation()}
            className={`
        absolute z-50 w-72
        bg-white rounded-2xl shadow-2xl border border-gray-100
        ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
        ${flipped ? 'right-0' : 'left-0'}
      `}
        >
            {onClose && (
                <button
                    onClick={e => { e.stopPropagation(); onClose() }}
                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 text-lg leading-none transition-colors"
                >
                    ×
                </button>
            )}
            {children}
        </div>
    )
}
