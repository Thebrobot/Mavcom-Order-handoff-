import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DealSubmissionForm from './DealSubmissionForm.jsx'
import LoginPage from './portal/LoginPage.jsx'
import PartnerDashboard from './portal/PartnerDashboard.jsx'
import AdminDashboard from './portal/AdminDashboard.jsx'
import ProtectedRoute from './portal/ProtectedRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DealSubmissionForm />} />
        <Route path="/portal/login" element={<LoginPage />} />
        <Route
          path="/portal/dashboard"
          element={
            <ProtectedRoute>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/portal" element={<Navigate to="/portal/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
