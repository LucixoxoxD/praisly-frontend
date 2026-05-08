import { Link } from 'react-router-dom'

const PROSE = `
  .legal-h2 {
    font-family: 'Plus Jakarta Sans', system-ui;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 36px 0 10px;
  }
  .legal-p {
    font-size: 16px;
    color: #374151;
    line-height: 1.75;
    margin: 0 0 12px;
  }
  .legal-ul {
    margin: 0 0 12px;
    padding-left: 20px;
  }
  .legal-ul li {
    font-size: 16px;
    color: #374151;
    line-height: 1.75;
    margin-bottom: 4px;
  }
`

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{PROSE}</style>

      {/* Top nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 800, color: '#0f172a', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            Praisly
          </Link>
          <Link to="/" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 40 }}>Last updated: May 2026</p>

        <p className="legal-p">
          Praisly is a Google review collection tool for Indian local businesses. This page explains what data we collect, how we use it, and how we protect it. We have kept this short and readable on purpose.
        </p>

        <h2 className="legal-h2">What data we collect</h2>
        <p className="legal-p">When you create an account and use Praisly, we collect:</p>
        <ul className="legal-ul">
          <li>Your business name, email address, phone number, city, and business type</li>
          <li>Your Google Business Place ID and review link (set during onboarding)</li>
          <li>Customer names and phone numbers you enter when sending review requests</li>
          <li>Star ratings, review text, and private feedback submitted by your customers</li>
          <li>Payment information — handled entirely by Razorpay. We never see or store your card details.</li>
        </ul>

        <h2 className="legal-h2">How we use your data</h2>
        <ul className="legal-ul">
          <li>To generate AI-drafted review suggestions for your customers using Google Gemini</li>
          <li>To track your Google review count and rating over time</li>
          <li>To show you analytics on your dashboard (reviews gained, conversion rate, etc.)</li>
          <li>To send you WhatsApp review requests on your behalf</li>
          <li>To process subscription payments via Razorpay</li>
        </ul>
        <p className="legal-p">We do not sell your data to anyone. We do not use your data for advertising.</p>

        <h2 className="legal-h2">Third-party services</h2>
        <ul className="legal-ul">
          <li><strong>Supabase</strong> — database and user authentication. Your password is never stored by us; Supabase handles it securely.</li>
          <li><strong>Google Places API</strong> — to look up and track your Google review count and rating.</li>
          <li><strong>Google Gemini AI</strong> — to generate review draft suggestions. We send your business name, type, and customer feedback tags. No personally identifiable data is shared.</li>
          <li><strong>Razorpay</strong> — to process subscription payments. See Razorpay's privacy policy for how they handle payment data.</li>
        </ul>

        <h2 className="legal-h2">Cookies and local storage</h2>
        <p className="legal-p">
          We store your authentication token in your browser's local storage to keep you logged in. We do not use tracking cookies or third-party advertising cookies.
        </p>

        <h2 className="legal-h2">Data retention</h2>
        <p className="legal-p">
          Your business data and review history are kept for as long as your account is active. If you delete your account, we will delete your data within 30 days. To request deletion, email us at support@praisly.in.
        </p>

        <h2 className="legal-h2">Security</h2>
        <p className="legal-p">
          All data is stored on Supabase with row-level security enabled. Data in transit is encrypted via HTTPS. We never store customer passwords.
        </p>

        <h2 className="legal-h2">Your rights</h2>
        <p className="legal-p">
          You can request a copy of your data or ask us to delete it at any time by emailing support@praisly.in. We will respond within 7 business days.
        </p>

        <h2 className="legal-h2">Contact</h2>
        <p className="legal-p">
          Questions about this policy? Email us at <a href="mailto:support@praisly.in" style={{ color: '#10b981' }}>support@praisly.in</a>.
          <br />
          Praisly is operated by Rahul Kumar, India.
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
          © 2026 Praisly · <Link to="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
