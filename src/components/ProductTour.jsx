import './ProductTour.css'
import BrandMark from './BrandMark'
export default function ProductTour() {
  return <section className="pw-tour pw-wrap" id="product" aria-labelledby="tour-title">
    <div className="pw-tour-copy">
      <span className="pw-kicker">03 / INSIDE THE PRODUCT</span>
      <h2 id="tour-title">Your first invitation.<br /><em>Ready to print.</em></h2>
      <p>A simple invitation for your counter, your tables, or wherever customers pause. Here’s how you put it to work.</p>
      <ol>
        <li><strong>Add your business.</strong><span>Find your existing Google listing or paste its Google Maps link during setup.</span></li>
        <li><strong>Download your QR code.</strong><span>Save the image and print it for your counter, tables or receipts. Printing and a physical stand are not included.</span></li>
        <li><strong>Invite honest feedback.</strong><span>Customers scan or open your link. You can read private feedback and review activity in your dashboard.</span></li>
      </ol>
      <a className="pw-text-link" href="#demo">Try the editable draft sample ↓</a>
    </div>
    <figure className="pw-tour-preview">
      <div className="pw-print-scene">
        <div className="pw-print-meta"><span>YOUR NEXT CONVERSATION</span><span aria-hidden="true">↗</span></div>
        <div className="pw-print-orbit" aria-hidden="true" />
        <div className="pw-print-paper">
          <div className="pw-print-brand"><span className="pw-print-flower" aria-hidden="true">✳</span><span>bloom<small>COFFEE & COMPANY</small></span></div>
          <div className="pw-print-rule" />
          <p className="pw-print-title">How was<br /><em>your visit?</em></p>
          <p className="pw-print-subtitle">A few words.<br />A little difference.</p>
          <img className="pw-print-qr" src="/images/sample-review-qr.svg" alt="Sample QR code that opens the Praisly demo" width="220" height="220" loading="lazy" />
          <p className="pw-print-scan">SCAN TO SHARE YOUR EXPERIENCE</p>
          <div className="pw-print-signoff"><span>With a little help from</span><strong><BrandMark />praisly</strong></div>
        </div>
        <div className="pw-print-bottom"><span>Small code.<br /><em>Open conversation.</em></span><a href="#demo" aria-label="Try the sample review experience">Try the sample <span aria-hidden="true">↗</span></a></div>
      </div>
      <figcaption>Design illustration · fictional business · scan the sample QR to try the demo.</figcaption>
    </figure>
  </section>
}
