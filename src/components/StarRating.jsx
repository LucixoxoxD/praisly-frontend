export default function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-3 justify-center my-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="text-5xl leading-none transition-transform active:scale-90 focus:outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <span style={{ color: star <= value ? '#f59e0b' : '#d1d5db' }}>★</span>
        </button>
      ))}
    </div>
  )
}
