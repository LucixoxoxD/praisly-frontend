import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/api'
import { ToastProvider } from './components/Toast'
import DashboardLayout from './components/DashboardLayout'
import CustomerReview from './pages/CustomerReview'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Reviews from './pages/Reviews'
import QRCode from './pages/QRCode'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import SendRequest from './pages/SendRequest'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

function Protected({ children }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />
  const biz = authService.getBusiness()
  if (biz && biz.onboarding_completed === false) return <Navigate to="/onboarding" replace />
  return children
}

function AuthOnly({ children }) {
  if (!authService.isAuthenticated()) return children
  const biz = authService.getBusiness()
  return <Navigate to={biz?.onboarding_completed === false ? '/onboarding' : '/dashboard'} replace />
}

function OnboardingRoute({ children }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />
  const biz = authService.getBusiness()
  if (biz?.onboarding_completed === true) return <Navigate to="/dashboard" replace />
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
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />
          <Route path="/login"      element={<AuthOnly><Login /></AuthOnly>} />
          <Route path="/signup"     element={<AuthOnly><Signup /></AuthOnly>} />
          <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

          {/* Public legal pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms"   element={<TermsOfService />} />

          {/* Public customer-facing review page — untouched */}
          <Route path="/review/:businessId" element={<CustomerReview />} />

          {/* Protected dashboard pages */}
          <Route path="/dashboard" element={<WithLayout><Dashboard /></WithLayout>} />
          <Route path="/reviews"   element={<WithLayout><Reviews /></WithLayout>} />
          <Route path="/qr"        element={<WithLayout><QRCode /></WithLayout>} />
          <Route path="/send"      element={<WithLayout><SendRequest /></WithLayout>} />
          <Route path="/settings"  element={<WithLayout><Settings /></WithLayout>} />
          <Route path="/billing"   element={<WithLayout><Billing /></WithLayout>} />

          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen text-gray-400">
                Page not found
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
