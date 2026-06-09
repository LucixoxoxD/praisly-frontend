import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService, refreshAuth } from './services/api'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import DashboardLayout from './components/DashboardLayout'

// Route-level code splitting — each page becomes its own chunk so visitors
// only download what they need. Critical for customers scanning a QR code
// on slow mobile connections: they get the review page, not the dashboard.
const CustomerReview  = lazy(() => import('./pages/CustomerReview'))
const LandingPage     = lazy(() => import('./pages/LandingPage'))
const Login           = lazy(() => import('./pages/Login'))
const Signup          = lazy(() => import('./pages/Signup'))
const Onboarding      = lazy(() => import('./pages/Onboarding'))
const Dashboard       = lazy(() => import('./pages/Dashboard'))
const Reviews         = lazy(() => import('./pages/Reviews'))
const QRCode          = lazy(() => import('./pages/QRCode'))
const Settings        = lazy(() => import('./pages/Settings'))
const Billing         = lazy(() => import('./pages/Billing'))
const SendRequest     = lazy(() => import('./pages/SendRequest'))
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword   = lazy(() => import('./pages/ResetPassword'))
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService  = lazy(() => import('./pages/TermsOfService'))
const AgentSignup     = lazy(() => import('./pages/AgentSignup'))
const Admin           = lazy(() => import('./pages/Admin'))
const Roast           = lazy(() => import('./pages/Roast'))

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <style>{'@keyframes _spin { to { transform: rotate(360deg); } }'}</style>
      <div style={{
        width: 28, height: 28,
        border: '3px solid #e2e8f0',
        borderTopColor: '#C4831A',
        borderRadius: '50%',
        animation: '_spin 0.8s linear infinite',
      }} />
    </div>
  )
}

function Protected({ children }) {
  const hasToken = !!localStorage.getItem('praisly_token')
  const hasRefresh = !!localStorage.getItem('praisly_refresh_token')

  const [status, setStatus] = useState(hasToken ? 'ok' : hasRefresh ? 'checking' : 'redirect')

  useEffect(() => {
    if (status !== 'checking') return
    refreshAuth().then((ok) => setStatus(ok ? 'ok' : 'redirect'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'checking') return <Spinner />

  if (status === 'redirect') return <Navigate to="/login" replace />

  const biz = authService.getBusiness()
  if (!biz) return <Navigate to="/admin" replace />
  if (biz.onboarding_completed === false) return <Navigate to="/onboarding" replace />
  return children
}

function AuthOnly({ children }) {
  if (!authService.isAuthenticated()) return children
  const biz = authService.getBusiness()
  return <Navigate to={biz?.onboarding_completed === false ? '/onboarding' : '/dashboard'} replace />
}

function OnboardingRoute({ children }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />
  // Always allow access — the Onboarding page itself checks /api/onboarding/status
  // and redirects to /dashboard if the active business is already onboarded.
  // This avoids stale-localStorage race conditions with multi-location switching.
  return children
}

function WithLayout({ children }) {
  return (
    <Protected>
      <DashboardLayout>{children}</DashboardLayout>
    </Protected>
  )
}

export default function App() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (accessToken) localStorage.setItem('praisly_token', accessToken)
      if (refreshToken) localStorage.setItem('praisly_refresh_token', refreshToken)
      window.location.replace('/reset-password')
    }
  }, [])

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route
                path="/"
                element={authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />}
              />
              <Route path="/login"           element={<AuthOnly><Login /></AuthOnly>} />
              <Route path="/signup"          element={<AuthOnly><Signup /></AuthOnly>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

              {/* Public pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms"   element={<TermsOfService />} />
              <Route path="/roast"   element={<Roast />} />

              {/* Public customer-facing review page — untouched */}
              <Route path="/review/:businessId" element={<CustomerReview />} />

              {/* Protected dashboard pages */}
              <Route path="/dashboard" element={<WithLayout><Dashboard /></WithLayout>} />
              <Route path="/reviews"   element={<WithLayout><Reviews /></WithLayout>} />
              <Route path="/qr"        element={<WithLayout><QRCode /></WithLayout>} />
              <Route path="/send"      element={<WithLayout><SendRequest /></WithLayout>} />
              <Route path="/settings"  element={<WithLayout><Settings /></WithLayout>} />
              <Route path="/billing"   element={<WithLayout><Billing /></WithLayout>} />
              <Route path="/agent"    element={<AgentSignup />} />
              <Route path="/admin"   element={<Admin />} />

              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-screen text-gray-400">
                    Page not found
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  )
}
