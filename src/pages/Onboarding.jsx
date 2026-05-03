import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { authService } from '../services/api'
import OnboardingProgress from '../components/onboarding/OnboardingProgress'
import StepGoogleBusiness from '../components/onboarding/StepGoogleBusiness'
import StepOwnerDetails from '../components/onboarding/StepOwnerDetails'
import StepComplete from '../components/onboarding/StepComplete'

const PAGE_CSS = `
  @keyframes stepIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .step-anim {
    animation: stepIn 0.25s ease forwards;
  }
`

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [biz, setBiz] = useState(null)
  const [formData, setFormData] = useState({
    googlePlaceId: null,
    googlePlaceName: '',
    googleBusinessUrl: '',
    ownerName: '',
    phone: '',
    preferredLanguage: 'both',
  })
  const [submitting, setSubmitting] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    api.get('/api/onboarding/status')
      .then((res) => {
        if (res.data.onboarding_completed === true) {
          navigate('/dashboard', { replace: true })
          return
        }
        setBiz(res.data)
      })
      .catch(() => {
        // API failed (e.g. DB column not yet migrated) — fall back to localStorage
        // so the user can still complete onboarding rather than being bounced away.
        const cached = authService.getBusiness()
        setBiz(cached || {})
      })
  }, [navigate])

  function updateData(patch) {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  function goToStep(n) {
    setAnimKey((k) => k + 1)
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleFinish(stepTwoPatch = {}) {
    setSubmitting(true)
    // Merge the freshly-typed step-2 values with accumulated formData.
    // Cannot rely on formData alone because React setState from onUpdate
    // is async — formData may not have updated before this runs.
    const merged = { ...formData, ...stepTwoPatch }
    try {
      const payload = {
        owner_name: merged.ownerName,
        phone: `+91${merged.phone}`,
        preferred_language: merged.preferredLanguage,
      }
      if (merged.googlePlaceId) {
        payload.google_place_id = merged.googlePlaceId
      } else {
        payload.google_business_url = merged.googleBusinessUrl
      }

      const res = await api.post('/api/onboarding/complete', payload)
      if (res.data?.business) {
        authService.setBusiness(res.data.business)
      }
      goToStep(3)
    } catch (err) {
      console.error('Onboarding complete failed', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 16px 60px',
    }}>
      <style>{PAGE_CSS}</style>

      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo / brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            fontSize: 22, fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', system-ui",
            color: '#0f172a',
            letterSpacing: '-0.5px',
          }}>
            praisly
          </span>
        </div>

        {/* Progress bar */}
        <OnboardingProgress current={step} />

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}>
          <div key={animKey} className="step-anim">
            {step === 1 && (
              <StepGoogleBusiness
                biz={biz}
                data={formData}
                onUpdate={updateData}
                onNext={() => goToStep(2)}
              />
            )}
            {step === 2 && (
              <StepOwnerDetails
                data={formData}
                onUpdate={updateData}
                onBack={() => goToStep(1)}
                onNext={handleFinish}
                submitting={submitting}
              />
            )}
            {step === 3 && (
              <StepComplete
                biz={biz}
                data={formData}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        {step < 3 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
            Step {step} of 2 &mdash; takes less than 2 minutes
          </p>
        )}
      </div>
    </div>
  )
}
