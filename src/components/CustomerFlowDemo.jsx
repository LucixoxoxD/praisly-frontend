import { useRef, useState } from 'react'
import './CustomerFlowDemo.css'

const sampleNotes = 'flat white was smooth; quiet table; waited 15 minutes'
const sampleDraft = 'The flat white was smooth, and I appreciated the quiet table. I waited 15 minutes for my order.'

const steps = ['Your experience', 'Your words', 'Your choice']

export default function CustomerFlowDemo() {
  const [step, setStep] = useState(0)
  const [rating, setRating] = useState(0)
  const [experience, setExperience] = useState('')
  const [draft, setDraft] = useState('')
  const [draftSource, setDraftSource] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const heading = useRef(null)

  function goTo(next) {
    setStep(next)
    setCopyStatus('')
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
    })
  }

  function createDraft(event) {
    event.preventDefault()
    // The preview uses only the visitor's words; it makes no AI or review API calls.
    if (experience.trim() !== draftSource) setDraft(experience.trim() === sampleNotes ? sampleDraft : experience.trim())
    setDraftSource(experience.trim())
    goTo(1)
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft)
      setCopyStatus('Copied. This sample has not been posted anywhere.')
    } catch {
      setCopyStatus('Copy is unavailable. Go back to select and copy your draft manually.')
    }
  }

  function restart() {
    setRating(0)
    setExperience('')
    setDraft('')
    setDraftSource('')
    goTo(0)
  }

  return (
    <section className="pw-demo pw-wrap" id="demo" aria-labelledby="demo-title">
      <div className="pw-demo-intro">
        <span className="pw-kicker">TRY IT / NO SIGNUP NEEDED</span>
        <h2 id="demo-title">A few details.<br /><em>A draft to make yours.</em></h2>
        <p>Try a prepared example: three notes become a readable draft, with the wait time kept in. Then edit it as a customer would.</p>
        <p className="pw-demo-disclaimer"><strong>Interactive sample</strong><br />Nothing is saved or submitted. The example is prewritten, not generated live. Custom text is kept as entered. This sample demonstrates drafting and sharing, not every step of the live feedback flow.</p>
      </div>
      <div className="pw-demo-card">
        <div className="pw-demo-business"><span aria-hidden="true">b.</span><div><strong>Bloom Coffee</strong><small>Fictional business · sample experience</small></div></div>
        <ol className="pw-demo-progress" aria-label="Demo progress">
          {steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}><span>{index + 1}</span>{label}</li>)}
        </ol>
        <h3 ref={heading} tabIndex={-1}>{['How was your visit?', 'Make it sound like you.', 'You decide what to share.'][step]}</h3>
        {step === 0 && <form onSubmit={createDraft}>
          <fieldset className="pw-demo-rating">
            <legend>Your sample rating</legend>
            <div>{[1, 2, 3, 4, 5].map(value => <label key={value}>
              <input type="radio" name="demo-rating" value={value} checked={rating === value} onChange={() => setRating(value)} required aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`} />
              <span className={value <= rating ? 'is-selected' : ''} aria-hidden="true">★</span>
            </label>)}</div>
            <p aria-live="polite">{rating ? `${rating} out of 5 stars selected` : 'Choose any rating to try the sample.'}</p>
          </fieldset>
          <button className="pw-demo-example" type="button" onClick={() => { setRating(3); setExperience(sampleNotes) }}>Use the coffee-shop example <span aria-hidden="true">↙</span></button>
          <label className="pw-demo-label" htmlFor="demo-experience">What would you like to say?</label>
          <textarea id="demo-experience" value={experience} onChange={event => setExperience(event.target.value)} placeholder="For example: The coffee was lovely, but the wait was a little long." maxLength={1200} required rows={4} aria-describedby="demo-text-help" />
          <p id="demo-text-help" className="pw-demo-help">Use a made-up visit to explore the demo. Your words stay in this page until you leave or start again.</p>
          <button className="pw-button" type="submit" disabled={!rating || !experience.trim()}>Preview your draft <span aria-hidden="true">↗</span></button>
        </form>}
        {step === 1 && <div>
          <p className="pw-demo-help">Your sample rating: {rating}/5. {draftSource === sampleNotes ? "This prepared example turns the notes into sentences without removing the wait time." : "Custom text is shown as entered; this preview does not run AI."} Edit anything before continuing.</p>
          <div className="pw-demo-source"><strong>Your original notes</strong><p>{draftSource}</p></div>
          <label className="pw-demo-label" htmlFor="demo-draft">Your editable draft</label>
          <textarea id="demo-draft" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1200} rows={5} />
          <div className="pw-demo-actions"><button className="pw-button" disabled={!draft.trim()} onClick={() => goTo(2)}>See posting steps <span aria-hidden="true">↗</span></button><button className="pw-demo-back" onClick={() => goTo(0)}>Back</button></div>
        </div>}
        {step === 2 && <div>
          <p className="pw-demo-help">In a real visit, you would:</p>
          <ol className="pw-demo-instructions"><li>Copy the words you want to share.</li><li>Open the business's Google review page and sign in to your own Google account.</li><li>Choose your rating, paste or edit your words, and decide whether to publish.</li></ol>
          <p className="pw-demo-help">This demo ends here. It does not open Google or post a review.</p>
          <div className="pw-demo-actions"><button className="pw-button" onClick={copyDraft}>Copy sample text <span aria-hidden="true">↗</span></button><button className="pw-demo-back" onClick={() => goTo(1)}>Edit draft</button></div>
          <p className="pw-demo-status" role="status">{copyStatus}</p>
          <button className="pw-demo-back" onClick={restart}>Start again</button>
        </div>}
      </div>
    </section>
  )
}
