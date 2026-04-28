import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { authService } from '../services/api'
import { useToast } from '../components/Toast'

const PAGE_STYLE = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
`

const PLANS = [
  {
    name: 'free',
    label: 'Free',
    price: '₹0',
    period: '/month',
    limitLabel: '10 reviews/month',
    color: '#64748b',
    features: [
      'QR code generation',
      'Basic dashboard',
      'AI review drafts',
      'Review gating',
    ],
  },
  {
    name: 'starter',
    label: 'Starter',
    price: '₹999',
    period: '/month',
    limitLabel: '100 reviews/month',
    color: '#10b981',
    popular: true,
    features: [
      'Everything in Free',
      '100 reviews/month',
      'Analytics & charts',
      'Email support',
    ],
  },
  {
    name: 'pro',
    label: 'Pro',
    price: '₹2,499',
    period: '/month',
    limitLabel: 'Unlimited reviews',
    color: '#8b5cf6',
    features: [
      'Everything in Starter',
      'Unlimited reviews',
      'AI auto-reply drafts',
      'Weekly reports',
      'Priority support',
    ],
  },
]

const PLAN_RANK = { free: 0, starter: 1, pro: 2, agency: 3 }

function PlanBadge({ plan }) {
  const map = {
    free:    { bg: '#f1f5f9', color: '#475569', label: 'Free' },
    starter: { bg: '#d1fae5', color: '#065f46', label: 'Starter' },
    pro:     { bg: '#ede9fe', color: '#5b21b6', label: 'Pro' },
    agency:  { bg: '#fce7f3', color: '#9d174d', label: 'Agency' },
  }
  const s = map[plan] || map.free
  return (
    <span
      style={{
        padding: '5px 16px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}

export default function Billing() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [planStatus, setPlanStatus]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [upgrading, setUpgrading]     = useState(null)
  const [verifying, setVerifying]     = useState(false)
  const biz = authService.getBusiness()

  // Load current plan status from backend
  useEffect(() => {
    api
      .get('/api/payments/status')
      .then((r) => setPlanStatus(r.data))
      .catch(() =>
        setPlanStatus({
          plan: biz?.plan || 'free',
          monthly_request_count: biz?.monthly_request_count || 0,
          monthly_request_limit: 10,
        })
      )
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle post-payment redirect from Razorpay
  useEffect(() => {
    const paymentId      = searchParams.get('razorpay_payment_id')
    const subscriptionId = searchParams.get('razorpay_subscription_id')
    const signature      = searchParams.get('razorpay_signature')
    const planName       = searchParams.get('plan_name') || 'starter'

    if (!paymentId || !subscriptionId || !signature) return

    setVerifying(true)
    api
      .post('/api/payments/verify', {
        razorpay_payment_id:      paymentId,
        razorpay_subscription_id: subscriptionId,
        razorpay_signature:       signature,
        plan_name:                planName,
      })
      .then((r) => {
        toast(`Plan upgraded to ${r.data.plan}! 🎉`)
        authService.setBusiness({ ...authService.getBusiness(), plan: r.data.plan })
        setPlanStatus((prev) => ({ ...prev, plan: r.data.plan }))
        window.history.replaceState({}, '', '/billing')
      })
      .catch(() => toast('Payment verification failed. Please contact support.', 'error'))
      .finally(() => setVerifying(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpgrade(planName) {
    setUpgrading(planName)
    try {
      const res = await api.post('/api/payments/create-subscription', { plan_name: planName })
      window.location.href = res.data.short_url
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to start checkout. Please try again.', 'error')
      setUpgrading(null)
    }
  }

  const currentPlan = planStatus?.plan || biz?.plan || 'free'
  const used        = planStatus?.monthly_request_count ?? 0
  const limit       = planStatus?.monthly_request_limit ?? 10
  const unlimited   = limit >= 999_999
  const pct         = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const barColor    = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'

  return (
    <div style={{ animation: 'fadeUp 0.2s ease' }}>
      <style>{PAGE_STYLE}</style>

      <h1
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui",
          fontSize: 22,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 24,
        }}
      >
        Billing &amp; Plans
      </h1>

      {/* Current usage card */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          border: '1px solid #e2e8f0',
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
          Current Usage
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <PlanBadge plan={currentPlan} />
          <span style={{ color: '#64748b', fontSize: 14 }}>
            {loading || verifying
              ? 'Loading…'
              : `${used} of ${unlimited ? '∞' : limit} reviews used this month`}
          </span>
        </div>

        {!unlimited && (
          <>
            <div
              style={{
                background: '#f1f5f9',
                borderRadius: 99,
                height: 10,
                overflow: 'hidden',
                marginBottom: 6,
                maxWidth: 400,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: barColor,
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: pct >= 70 ? barColor : '#94a3b8', margin: 0 }}>
              {pct >= 90
                ? `⚠️ Only ${limit - used} review${limit - used !== 1 ? 's' : ''} remaining`
                : `${limit - used} remaining this month`}
            </p>
          </>
        )}
      </div>

      {/* Pricing cards */}
      <h2
        style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}
      >
        Choose a Plan
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {PLANS.map((p) => {
          const isCurrent  = currentPlan === p.name
          const isDowngrade = PLAN_RANK[p.name] < PLAN_RANK[currentPlan]
          const showUpgrade = !isCurrent && !isDowngrade && p.name !== 'free'
          const isLoading   = upgrading === p.name

          return (
            <div
              key={p.name}
              style={{
                background: p.popular ? '#f0fdf4' : 'white',
                borderRadius: 16,
                padding: 24,
                border: `2px solid ${p.popular ? '#10b981' : '#e2e8f0'}`,
                position: 'relative',
                transition: 'box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              {p.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#10b981',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 14px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: p.color,
                  margin: '0 0 6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {p.label}
              </p>

              {/* Price */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 2,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: "'Plus Jakarta Sans', system-ui",
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{p.period}</span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  fontWeight: 500,
                  margin: '0 0 18px',
                }}
              >
                {p.limitLabel}
              </p>

              {/* Features */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 20px',
                  flex: 1,
                }}
              >
                {p.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        color: p.color,
                        fontSize: 14,
                        lineHeight: '20px',
                        flexShrink: 0,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  ✓ Current Plan
                </div>
              ) : isDowngrade || p.name === 'free' ? (
                <div style={{ height: 40 }} />
              ) : (
                <button
                  onClick={() => handleUpgrade(p.name)}
                  disabled={!!upgrading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: isLoading ? '#9ca3af' : p.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: upgrading ? 'not-allowed' : 'pointer',
                    opacity: upgrading && !isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {isLoading ? 'Redirecting…' : 'Upgrade →'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
        Payments are processed securely by Razorpay · Cancel anytime
      </p>
    </div>
  )
}
