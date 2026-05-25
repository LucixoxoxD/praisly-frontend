import { useState } from 'react'

export default function PrivateFeedback({ businessName, onSubmit, loading }) {
  const [text, setText] = useState('')

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm leading-relaxed">
        We're sorry to hear that. Your feedback will go{' '}
        <span className="font-semibold text-gray-800">directly to {businessName}</span>{' '}
        and will <span className="font-semibold">not</span> be posted publicly.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What could we have done better?"
        rows={4}
        maxLength={2000}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400"
      />
      <button
        onClick={() => onSubmit(text)}
        disabled={!text.trim() || loading}
        className="w-full py-4 rounded-xl font-semibold text-white text-base disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: text.trim() && !loading ? '#374151' : undefined, background: !text.trim() || loading ? '#9ca3af' : '#374151' }}
      >
        {loading ? 'Sending...' : 'Send Feedback'}
      </button>
    </div>
  )
}
