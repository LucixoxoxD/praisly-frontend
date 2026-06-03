import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api, { authService } from '../services/api'
import { useToast } from '../components/Toast'
import { PENDING_LOCATION_KEY, PENDING_ADDON_QTY_KEY } from '../components/LocationSwitcher'

const PAGE_STYLE = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 60% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
`

const FEATURES = [
  'Unlimited review requests',
  'AI-powered review drafts',
  'Smart review routing',
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

    if (!paymentId || !subscriptionId || !signature) return

    // If a location was stashed before checkout, this return is a per-location
    // add-on purchase — verify it, create the stashed location, then onboard it.
    const pendingRaw = localStorage.getItem(PENDING_LOCATION_KEY)
    if (pendingRaw) {
      const qty = parseInt(localStorage.getItem(PENDING_ADDON_QTY_KEY) || '1', 10) || 1
      let pending = null
      try { pending = JSON.parse(pendingRaw) } catch { /* ignore */ }

      setVerifying(true)
      api.post('/api/locations/purchase/verify', {
        razorpay_payment_id:      paymentId,
        razorpay_subscription_id: subscriptionId,
        razorpay_signature:       signature,
        quantity:                 qty,
      })
        .then(() => api.post('/api/locations', pending))
        .then(res => {
          localStorage.removeItem(PENDING_LOCATION_KEY)
          localStorage.removeItem(PENDING_ADDON_QTY_KEY)
          const newLoc = res.data.location
          authService.switchLocation(newLoc)
          toast('Location added! Let’s set it up. 🎉')
          window.location.href = '/onboarding'
        })
        .catch(() => {
          toast('Payment succeeded but we couldn’t finish adding the location. Please contact support.', 'error')
          localStorage.removeItem(PENDING_LOCATION_KEY)
          localStorage.removeItem(PENDING_ADDON_QTY_KEY)
          window.history.replaceState({}, '', '/billing')
          setVerifying(false)
        })
      return
    }

    // Otherwise it's a base-plan subscription.
    const planName = searchParams.get('plan_name') || 'monthly'
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

  // Coupon code state
  const [couponCode, setCouponCode]       = useState('')
  const [couponStatus, setCouponStatus]   = useState(null) // null | 'checking' | { valid, offer_id, label } | { valid: false, message }
  const [showCoupon, setShowCoupon]       = useState(false)

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setCouponStatus('checking')
    try {
      const res = await api.post('/api/payments/validate-coupon', { code })
      setCouponStatus({ valid: true, offer_id: res.data.offer_id, label: res.data.label, discount: res.data.discount_percent || 0 })
      toast(`Coupon applied: ${res.data.label}`)
    } catch (err) {
      setCouponStatus({ valid: false, message: err.response?.data?.detail || 'Invalid coupon code' })
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setCouponStatus(null)
  }

  async function handleStart() {
    const planName = yearly ? 'yearly' : 'monthly'
    setUpgrading(true)
    try {
      const payload = { plan_name: planName }
      if (couponStatus?.valid && couponStatus.offer_id) {
        payload.offer_id = couponStatus.offer_id
      }
      const res = await api.post('/api/payments/create-subscription', payload)
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

  // Price calculations with coupon support
  const discountPct   = couponStatus?.valid ? couponStatus.discount : 0
  const monthlyBase   = 999
  const yearlyBase    = 9999
  const monthlyPrice  = Math.round(monthlyBase * (1 - discountPct / 100))
  const yearlyPrice   = Math.round(yearlyBase * (1 - discountPct / 100))
  const yearlyPerMonth = Math.round(yearlyPrice / 12)
  const dailyYearly   = Math.round(yearlyPrice / 365)
  const dailyMonthly  = Math.round(monthlyPrice / 30)

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
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--win)' }}>Save ~₹2,000 (17% off)</span>
          </button>
        </div>
      </div>

      {/* Single pricing card */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '2px solid var(--primary)',
        boxShadow: '0 8px 32px rgba(216,144,32,0.15)',
        padding: 32, position: 'relative',
      }}>
        {/* Top badge */}
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 18px', borderRadius: 999, whiteSpace: 'nowrap' }}>
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

        {/* Discount percentage badge */}
        {discountPct > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 12, animation: 'popIn 0.4s ease' }}>
            <span style={{
              display: 'inline-block', padding: '6px 18px', borderRadius: 999, fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
              color: 'white',
              background: 'linear-gradient(135deg, #059669, #10b981, #059669)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite linear',
              boxShadow: '0 2px 12px rgba(5,150,105,0.3)',
            }}>
              {discountPct}% OFF APPLIED
            </span>
          </div>
        )}

        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          {/* Strikethrough original price */}
          {(yearly || discountPct > 0) && (
            <p style={{ fontSize: discountPct > 0 ? 16 : 13, color: '#94a3b8', textDecoration: 'line-through', margin: '0 0 4px', transition: 'font-size 0.2s' }}>
              {yearly
                ? (discountPct > 0 ? `₹${833}/month` : '₹999/month')
                : `₹${monthlyBase}/month`}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 48, fontWeight: 800, lineHeight: 1,
              color: discountPct > 0 ? '#059669' : '#0f172a',
              transition: 'color 0.3s',
              ...(discountPct > 0 ? { animation: 'popIn 0.3s ease' } : {}),
            }}>
              {yearly ? `₹${yearlyPerMonth.toLocaleString('en-IN')}` : `₹${monthlyPrice.toLocaleString('en-IN')}`}
            </span>
            <span style={{ fontSize: 16, color: '#94a3b8' }}>/month</span>
          </div>
          {yearly && (
            <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>
              {discountPct > 0 && <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: 6 }}>₹9,999</span>}
              ₹{yearlyPrice.toLocaleString('en-IN')} billed yearly
            </p>
          )}
        </div>

        {/* Comparison line */}
        <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: '8px 0 0' }}>
          {yearly
            ? `Less than ₹${dailyYearly}/day — cheaper than auto fare`
            : `Less than ₹${dailyMonthly}/day — that's one samosa plate`}
        </p>

        {/* Savings badge */}
        {yearly && (
          <div style={{ textAlign: 'center', margin: '10px 0 0' }}>
            <span style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
              {discountPct > 0
                ? `You save ₹${(yearlyBase - yearlyPrice + (monthlyBase * 12 - yearlyBase)).toLocaleString('en-IN')}/year with coupon + yearly`
                : 'You save ~₹2,000/year — 17% off'}
            </span>
          </div>
        )}

        {/* Extra hype banner when coupon is active */}
        {discountPct > 0 && (
          <div style={{
            margin: '12px 0 0', padding: '10px 16px', borderRadius: 12, textAlign: 'center',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px dashed #059669',
            animation: 'popIn 0.5s ease',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#065f46', margin: 0 }}>
              You're saving ₹{yearly
                ? (yearlyBase - yearlyPrice).toLocaleString('en-IN')
                : (monthlyBase - monthlyPrice).toLocaleString('en-IN')
              } {yearly ? 'this year' : 'every month'} with this coupon
            </p>
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

        {/* Coupon code */}
        {!loading && !isSubscribed && (
          <div style={{ marginBottom: 16 }}>
            {!showCoupon && !couponStatus?.valid ? (
              <button
                onClick={() => setShowCoupon(true)}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
              >
                Have a coupon code?
              </button>
            ) : couponStatus?.valid ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 12, animation: 'popIn 0.3s ease' }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>&#127881;</span>
                <span style={{ fontSize: 14, color: '#065f46', fontWeight: 700, flex: 1 }}>
                  {couponStatus.label}
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    style={{
                      flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10,
                      fontSize: 14, fontFamily: 'inherit', outline: 'none', letterSpacing: 1, fontWeight: 600,
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === 'checking' || !couponCode.trim()}
                    style={{
                      padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none',
                      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      opacity: (couponStatus === 'checking' || !couponCode.trim()) ? 0.5 : 1,
                    }}
                  >
                    {couponStatus === 'checking' ? '...' : 'Apply'}
                  </button>
                </div>
                {couponStatus?.valid === false && (
                  <p style={{ fontSize: 12, color: '#dc2626', margin: '6px 0 0' }}>{couponStatus.message}</p>
                )}
              </div>
            )}
          </div>
        )}

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
              background: upgrading ? '#9ca3af' : 'var(--primary)',
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
