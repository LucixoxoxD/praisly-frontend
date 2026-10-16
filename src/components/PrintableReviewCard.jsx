import BrandMark from './BrandMark'
import './PrintableReviewCard.css'

export default function PrintableReviewCard({ businessName, cardRef, qrRef }) {
  return <div className="qr-print-card" ref={cardRef}>
    <div className="qr-print-business">{businessName || 'Your business'}</div>
    <div className="qr-print-rule" />
    <h2 className="qr-print-title">How was<br /><em>your visit?</em></h2>
    <p className="qr-print-subtitle">A few words.<br />A little difference.</p>
    <div className="qr-print-code" ref={qrRef} aria-label="Scan this QR code to share your experience" role="img" />
    <p className="qr-print-scan">Scan to share your experience</p>
    <div className="qr-print-signoff">
      <span>With a little help from</span>
      <strong><BrandMark />praisly</strong>
    </div>
  </div>
}
