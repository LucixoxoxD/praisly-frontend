export default function ReviewDrafts({ drafts, onSelect, selectedDraft }) {
  const hinglish = drafts?.hinglish || []
  const english = drafts?.english || []

  const allDrafts = [
    ...hinglish.map((text, i) => ({ text, label: `Hinglish ${i + 1}`, lang: 'hinglish' })),
    ...english.map((text, i) => ({ text, label: `English ${i + 1}`, lang: 'english' })),
  ]

  return (
    <div className="space-y-3">
      {hinglish.length > 0 && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
          Hinglish
        </p>
      )}
      {hinglish.map((text, i) => (
        <DraftCard
          key={`h-${i}`}
          text={text}
          isSelected={selectedDraft === text}
          onSelect={() => onSelect(text)}
        />
      ))}

      {english.length > 0 && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mt-4">
          English
        </p>
      )}
      {english.map((text, i) => (
        <DraftCard
          key={`e-${i}`}
          text={text}
          isSelected={selectedDraft === text}
          onSelect={() => onSelect(text)}
        />
      ))}
    </div>
  )
}

function DraftCard({ text, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-98 focus:outline-none ${
        isSelected
          ? 'border-amber-400 bg-amber-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
      {isSelected && (
        <span className="inline-block mt-2 text-xs font-semibold text-amber-600">
          ✓ Selected
        </span>
      )}
    </button>
  )
}
