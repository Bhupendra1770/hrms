import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(circle at top left, rgba(91,92,240,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(20,184,166,0.18), transparent 28%), linear-gradient(180deg, #f8faff 0%, #eef3fb 100%)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 430px) minmax(320px, 420px)', gap: 24, alignItems: 'stretch' }}>
        <div className="section-card" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #131f3b 100%)', color: '#eef2ff', marginBottom: 0 }}>
          <div className="brand-badge"><span className="brand-dot" /><strong>People OS</strong></div>
          <h1 style={{ color: '#fff', fontSize: '2.2rem', marginTop: 24, marginBottom: 10 }}>A cleaner HR experience for modern teams.</h1>
          <p style={{ color: 'rgba(226,232,240,0.78)' }}>Manage employees, approvals, attendance, holidays, and analytics from one elegant workspace.</p>
          <div className="soft-list" style={{ marginTop: 22 }}>
            {['Employee directory and profiles', 'Attendance and leave tracking', 'Announcements, holidays, and reports'].map((item) => (
              <div key={item} className="soft-item" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }}>{item}</div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="section-card" style={{ width: 420, maxWidth: '100%', marginBottom: 0, alignSelf: 'center' }}>
          <div className="info-chip" style={{ marginBottom: 16 }}>Secure sign in</div>
          <h1 style={{ marginTop: 0, marginBottom: 10 }}>Welcome back</h1>
          <p style={{ color: '#64748b', marginTop: 0 }}>Use your admin or employee credentials to access the workspace.</p>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
          <button type="submit" style={buttonStyle}>Login to HRMS</button>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 14 }}>
            First create an admin from backend Swagger at <strong>/docs</strong>
          </p>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  marginTop: 8,
  marginBottom: 16,
}

const buttonStyle = {
  width: '100%',
  padding: 13,
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #5b5cf0 0%, #7c3aed 100%)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 12px 24px rgba(91,92,240,0.24)',
}
