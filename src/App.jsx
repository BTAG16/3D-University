import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './AdminAuthContext'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import SuperAdminLogin from './SuperAdminLogin'
import SuperAdminDashboard from './SuperAdminDashboard'
import SuperAdminMap from './SuperAdminMap'
import PublicMap from './PublicMap'
import EmbedMap from './EmbedMap'
import DemoMap from './DemoMap'
import Landing from './Landing'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import './App.css'

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/super-admin" element={<SuperAdminLogin />} />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/map" element={<SuperAdminMap />} />
          <Route path="/map" element={<PublicMap />} />
          <Route path="/embed" element={<EmbedMap />} />
          <Route path="/demo" element={<DemoMap />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}

export default App
