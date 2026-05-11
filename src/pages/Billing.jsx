import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api, { authService } from '../services/api'
import { useToast } from '../components/Toast'

const PAGE_STYLE = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`

const FEATURES = [
  'Unlimited review requests',
  'AI-powered review drafts',
  'Smart review gating',
  'QR code for your counter',
  'Competitor tracking & ranking',
  'Real-time dashboard & analytics',
  'Notification alerts',
  'Google rating tracker',
]

export default function Billing() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [yearly, setYearly]           = useState(true)
  const [planStatus, setPlanStatus]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [upgrading, setUpgrading]     = useState(false)
  const [verifying, setVerifying]     = useState(false)
  const biz = authService.getBusiness()

  useEffect(() => {
    api.get('/api/payments/status')
      .then(r => setPlanStatus(r.data))
      .catch(() => setPlanStatus({ plan: biz?.plan || null, is_trial: true, trial_expired: false, trial_days_remaining: 7 }))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle post-payment redirect from Razorpay
  useEffect(() => {
    const paymentId      = searchParams.get('razorpay_payment_id')
    const subscriptionId = searchParams.get('razorpay_subscription_id')
    const signature      = searchParams.get('razorpay_signature')
    const planName       = searchParams.get('plan_name') || 'monthly'

    if (!paymentId || !subscriptionId || !signature) return

    setVerifying(true)
    api.post('/api/payments/verify', {
      razorpay_payment_id:      paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature:       signature,
      plan_name:                planName,
    })
      .then(r => {
        const label = r.data.plan === 'yearly' ? 'Yearly' : 'Monthly'
        toast(`You're on the ${label} plan! 🎉`)
        authService.setBusiness({ ...authService.getBusiness(), plan: r.data.plan })
        setPlanStatus(prev => ({ ...prev, plan: r.data.plan, is_trial: false }))
        window.history.replaceState({}, '', '/billing')
      })
      .catch(() => toast('Payment verification failed. Please contact support.', 'error'))
      .finally(() => setVerifying(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    const planName = yearly ? 'yearly' : 'monthly'
    setUpgrading(true)
    try {
      const res = await api.post('/api/payments/create-subscription', { plan_name: planName })
      window.location.href = res.data.short_url
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to start checkout. Please try again.', 'error')
      setUpgrading(false)
    }
  }

  const currentPlan   = planStatus?.plan || biz?.plan || null
  const isSubscribed  = currentPlan === 'monthly' || currentPlan === 'yearly'
  const isTrial       = planStatus?.is_trial ?? true
  const trialExpired  = planStatus?.trial_expired ?? false
  const trialDaysLeft = planStatus?.trial_days_remaining ?? 7

  return (
    <div style={{ animation: 'fadeUp 0.2s ease', maxWidth: 560, margin: '0 auto' }}>
      <style>{PAGE_STYLE}</style>

      {/* Trial status banner */}
      {!loading && !isSubscribed && isTrial && (
        trialExpired ? (
          <div style={{ marginBottom: 24, padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>Your free trial has ended</p>
            <p style={{ fontSize: 13, color: '#b91c1c', margin: 0 }}>Subscribe to keep collecting reviews.</p>
          </div>
        ) : (
          <div style={{ marginBottom: 24, padding: '14px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', margin: 0 }}>
              You have <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong> left in your free trial
            </p>
          </div>
        )
      )}

      {/* Header */}
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6, textAlign: 'center' }}>
        Simple pricing. No surprises.
      </h1>
      <p style={{ fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
        Everything you need to grow your Google reviews.
      </p>

      {/* Monthly / Yearly pill toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 999, padding: 4 }}>
          <button
            onClick={() => setYearly(false)}
            style={{
              padding: '10px 24px', borderRadius: 999, border: 'none',
              fontSize: 14, fontWeight: yearly ? 500 : 700, cursor: 'pointer', fontFamily: 'inherit',
              background: yearly ? 'transparent' : 'white',
              color: yearly ? '#6b7280' : '#111827',
              boxShadow: yearly ? 'none' : '0 1px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            style={{
              padding: '10px 24px', borderRadius: 999, border: 'none',
              fontSize: 14, fontWeight: yearly ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit',
              background: yearly ? 'white' : 'transparent',
              color: yearly ? '#111827' : '#6b7280',
              boxShadow: yearly ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            Yearly
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Save ₹4,000</span>
          </button>
        </div>
      </div>

      {/* Single pricing card */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '2px solid #10b981',
        boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
        padding: 32, position: 'relative',
      }}>
        {/* Top badge */}
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 18px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          {yearly ? 'Best Value' : 'Full Access'}
        </div>

        {/* Plan name */}
        <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', textAlign: 'center' }}>
          Praisly
        </p>

        {/* Early adopter badge */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ display: 'inline-block', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
            🚀 Early Adopter Pricing
          </span>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          {yearly && (
            <p style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'line-through', margin: '0 0 4px' }}>
              ₹999/month
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 48, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {yearly ? '₹666' : '₹999'}
            </span>
            <span style={{ fontSize: 16, color: '#94a3b8' }}>/month</span>
          </div>
          {yearly && (
            <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>₹7,999 billed yearly</p>
          )}
        </div>

        {/* Comparison line */}
        <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: '8px 0 0' }}>
          {yearly
            ? 'Less than ₹23/day — cheaper than auto fare 🛺'
            : "Less than ₹34/day — that's one samosa plate 🥟"}
        </p>

        {/* Yearly savings badge */}
        {yearly && (
          <div style={{ textAlign: 'center', margin: '10px 0 0' }}>
            <span style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
              You save ₹4,000/year 🎉
            </span>
          </div>
        )}

        {/* Features list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FEATURES.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151' }}>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: 15, lineHeight: '20px', flexShrink: 0 }}>✅</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        {loading || verifying ? (
          <div style={{ height: 48, background: '#f1f5f9', borderRadius: 12, animation: 'fadeUp 0.5s infinite alternate' }} />
        ) : isSubscribed ? (
          <div style={{ width: '100%', padding: '14px', background: '#f8fafc', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#64748b', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            ✓ You're on the {currentPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan
          </div>
        ) : (
          <button
            onClick={handleStart}
            disabled={upgrading}
            style={{
              width: '100%', height: 48,
              background: upgrading ? '#9ca3af' : '#10b981',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: upgrading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {upgrading ? 'Redirecting…' : trialExpired ? 'Subscribe Now →' : 'Start Now →'}
          </button>
        )}

        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
          Cancel anytime. No lock-in.{' '}
          <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Terms of Service</Link>
        </p>
      </div>

      <p style={{ fontSize: 14, color: '#4b5563', fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
        Early adopter pricing won't last forever. Lock in this rate now.
      </p>

      {/* Trial notice — only shown when not yet expired */}
      {isTrial && !isSubscribed && !trialExpired && (
        <div style={{ marginTop: 28, padding: '20px 24px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Still not sure?
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            Start your 7-day free trial. No card required. Full access to everything.
          </p>
        </div>
      )}

      <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
        Payments processed securely by Razorpay
      </p>
    </div>
  )
}
