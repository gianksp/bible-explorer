// Highlights the English word(s) that correspond to the hovered Strong's number
export const EnglishWithHighlight = ({ text, hoveredStrongsNumber, originalWords }) => {
  if (!hoveredStrongsNumber || !originalWords.length || !text) {
    return <>{text}</>
  }

  // Find all english glosses for the hovered strongs number
  const matchingGlosses = originalWords
    .filter(w => w.strongsNumber === hoveredStrongsNumber)
    .map(w => w.englishGloss?.toLowerCase().trim())
    .filter(Boolean)

  if (!matchingGlosses.length) return <>{text}</>

  // Split text into words and highlight matches
  const parts = text.split(/(\s+)/)

  return (
    <>
      {parts.map((part, i) => {
        const clean = part.toLowerCase().replace(/[.,;:!?'"]/g, '').trim()
        const isMatch = matchingGlosses.some(gloss =>
          gloss.split(/\s+/).some(glossWord => clean === glossWord)
        )
        return isMatch
          ? <mark key={i} className="bg-amber-100 text-amber-900">{part}</mark>
          : <span key={i}>{part}</span>
      })}
    </>
  )
}