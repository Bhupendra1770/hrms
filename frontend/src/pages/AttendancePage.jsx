import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Button from '../components/Button'
import SectionCard from '../components/SectionCard'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'

export default function AttendancePage() {
  const { isAdmin } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ employee_id: '', attendance_date: '', check_in: '', check_out: '' })
  const [error, setError] = useState('')

  const loadData = async () => {
    const attendanceReq = api.get('/attendance')
    const employeeReq = api.get('/employees')
    const [attendanceRes, employeeRes] = await Promise.all([attendanceReq, employeeReq])
    setAttendance(attendanceRes.data)
    setEmployees(employeeRes.data)
  }
  useEffect(() => { loadData().catch(() => setError('Failed to load attendance')) }, [])

  const employeeMap = useMemo(() => Object.fromEntries(employees.map((employee) => [employee.id, employee])), [employees])
  const today = new Date().toISOString().split('T')[0]
  const todayCount = attendance.filter((row) => row.attendance_date === today).length

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.post('/attendance', { ...form, employee_id: Number(form.employee_id), check_in: form.check_in || null, check_out: form.check_out || null })
      setForm({ employee_id: '', attendance_date: '', check_in: '', check_out: '' })
      loadData()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create attendance') }
  }

  return (
    <div>
      <div className="page-header"><div><h1>{isAdmin ? 'Attendance' : 'My Attendance'}</h1><p>{isAdmin ? 'Track daily check-ins and check-outs across the workforce.' : 'View your own attendance history and check-in records.'}</p></div></div>
      <div className="stats-grid">
        <StatCard title="Records Logged" value={attendance.length} note={isAdmin ? 'Total attendance entries' : 'Your attendance entries'} />
        <StatCard title="Marked Today" value={todayCount} note="Entries on today's date" />
      </div>

      {isAdmin ? (
        <SectionCard title="Mark Attendance" subtitle="Admin can log attendance for any employee and any date.">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user.full_name}</option>)}
            </select>
            <input type="date" value={form.attendance_date} onChange={(e) => setForm({ ...form, attendance_date: e.target.value })} required />
            <input type="time" value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
            <input type="time" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
            <Button type="submit">Save Attendance</Button>
          </form>
          {error ? <p style={{ color: '#ff9eab' }}>{error}</p> : null}
        </SectionCard>
      ) : null}

      <SectionCard title="Attendance Records" subtitle={isAdmin ? 'Latest attendance entries across employees.' : 'Your attendance records only.'}>
        <div className="table-wrap">
          {attendance.length === 0 ? <EmptyState compact title="No attendance records yet" description="Attendance entries will show here once logged." icon="🕘" /> : (
            <table className="directory-table">
              <thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th></tr></thead>
              <tbody>{attendance.map((row) => (<tr key={row.id}><td><div className="primary-cell"><strong>{employeeMap[row.employee_id]?.user?.full_name || `Employee #${row.employee_id}`}</strong><span className="secondary">{employeeMap[row.employee_id]?.job_title || 'Attendance entry'}</span></div></td><td>{row.attendance_date}</td><td>{row.check_in || '-'}</td><td>{row.check_out || '-'}</td></tr>))}</tbody>
            </table>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
