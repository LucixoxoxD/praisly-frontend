import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/api'
import { ToastProvider } from './components/Toast'
import DashboardLayout from './components/DashboardLayout'
import CustomerReview from './pages/CustomerReview'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Reviews from './pages/Reviews'
import QRCode from './pages/QRCode'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import SendRequest from './pages/SendRequest'

function Protected({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />
}

function AuthOnly({ children }) {
  return authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
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
          <Route path="/login"  element={<AuthOnly><Login /></AuthOnly>} />
          <Route path="/signup" element={<AuthOnly><Signup /></AuthOnly>} />

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
