import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'
import AttendancePage from './pages/AttendancePage'
import DashboardPage from './pages/DashboardPage'
import DepartmentsPage from './pages/DepartmentsPage'
import EmployeesPage from './pages/EmployeesPage'
import LeavesPage from './pages/LeavesPage'
import LoginPage from './pages/LoginPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import HolidaysPage from './pages/HolidaysPage'
import ReportsPage from './pages/ReportsPage'

function PrivateRoutes() {
  const { isAuthenticated, loadingUser, isAdmin } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (loadingUser) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#fff' }}>Loading workspace...</div>

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/departments" element={isAdmin ? <DepartmentsPage /> : <Navigate to="/" replace />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/holidays" element={<HolidaysPage />} />
        <Route path="/reports" element={isAdmin ? <ReportsPage /> : <Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}
