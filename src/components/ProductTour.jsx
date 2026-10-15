import './ProductTour.css'
export default function ProductTour() {
  return <section className="pw-tour pw-wrap" id="product" aria-labelledby="tour-title">
    <div className="pw-tour-copy">
      <span className="pw-kicker">03 / INSIDE THE PRODUCT</span>
      <h2 id="tour-title">Your first invitation.<br /><em>Ready to print.</em></h2>
      <p>This is Praisly’s QR download screen, shown with a fictional business. Here’s how you put it to work.</p>
      <ol>
        <li><strong>Add your business.</strong><span>Find your existing Google listing or paste its Google Maps link during setup.</span></li>
        <li><strong>Download your QR code.</strong><span>Save the image and print it for your counter, tables or receipts. Printing and a physical stand are not included.</span></li>
        <li><strong>Invite honest feedback.</strong><span>Customers scan or open your link. You can read private feedback and review activity in your dashboard.</span></li>
      </ol>
      <a className="pw-text-link" href="#demo">Try the editable draft sample ↓</a>
    </div>
    <figure><img src="/images/qr-download-sample.jpg" alt="Praisly QR download screen for fictional Bloom Coffee, showing a printable QR card and Download, Copy and WhatsApp controls" loading="lazy" width="1276" height="825" /><figcaption>Actual product screen · fictional business · sample QR opens this website’s demo, not a Google review page.</figcaption></figure>
  </section>
}
