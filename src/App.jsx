import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './AdminAuthContext'
import { ToastProvider } from './components/Toast'
import { PageLoader } from './components/LoadingSpinner'
import './App.css'

const Landing = lazy(() => import('./Landing'))
const AdminLogin = lazy(() => import('./AdminLogin'))
const AdminMfaSetup = lazy(() => import('./AdminMfaSetup'))
const AdminMfaChallenge = lazy(() => import('./AdminMfaChallenge'))
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const SuperAdminLogin = lazy(() => import('./SuperAdminLogin'))
const SuperAdminDashboard = lazy(() => import('./SuperAdminDashboard'))
const PublicMap = lazy(() => import('./PublicMap'))
const EmbedMap = lazy(() => import('./EmbedMap'))
const DemoMap = lazy(() => import('./DemoMap'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))

function App() {
  return (
    <ToastProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader text="Loading..." />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/mfa-setup" element={<AdminMfaSetup />} />
              <Route path="/admin/mfa-challenge" element={<AdminMfaChallenge />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/super-admin" element={<SuperAdminLogin />} />
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/map" element={<PublicMap />} />
              <Route path="/embed" element={<EmbedMap />} />
              <Route path="/demo" element={<DemoMap />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AdminAuthProvider>
    </ToastProvider>
  )
}

export default App
