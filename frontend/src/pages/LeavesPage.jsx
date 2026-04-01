import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Button from '../components/Button'
import SectionCard from '../components/SectionCard'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'

export default function LeavesPage() {
  const { isAdmin, user } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ employee_id: '', leave_type: '', start_date: '', end_date: '', reason: '' })
  const [error, setError] = useState('')

  const loadData = async () => {
    const [leaveRes, employeeRes] = await Promise.all([api.get('/leaves'), api.get('/employees')])
    setLeaveRequests(leaveRes.data)
    setEmployees(employeeRes.data)
    if (!isAdmin && employeeRes.data[0]) setForm((prev) => ({ ...prev, employee_id: String(employeeRes.data[0].id) }))
  }
  useEffect(() => { loadData().catch(() => setError('Failed to load leaves')) }, [])

  const employeeMap = useMemo(() => Object.fromEntries(employees.map((employee) => [employee.id, employee])), [employees])
  const leaveSummary = useMemo(() => ({
    total: leaveRequests.length,
    pending: leaveRequests.filter((leave) => leave.status === 'pending').length,
    approved: leaveRequests.filter((leave) => leave.status === 'approved').length,
    rejected: leaveRequests.filter((leave) => leave.status === 'rejected').length,
  }), [leaveRequests])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.post('/leaves', { ...form, employee_id: Number(form.employee_id) })
      setForm({ employee_id: isAdmin ? '' : form.employee_id, leave_type: '', start_date: '', end_date: '', reason: '' })
      loadData()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create leave request') }
  }

  const updateStatus = async (id, status) => {
    try { await api.patch(`/leaves/${id}/status`, { status }); loadData() } catch (err) { setError(err.response?.data?.detail || 'Failed to update leave status') }
  }
  const deleteLeave = async (id) => {
    if (!window.confirm('Delete this leave request?')) return
    try { await api.delete(`/leaves/${id}`); loadData() } catch (err) { setError(err.response?.data?.detail || 'Failed to delete leave request') }
  }

  return (
    <div>
      <div className="page-header"><div><h1>Leave Requests</h1><p>{isAdmin ? 'Track pending approvals, create requests, and review leave history.' : 'Apply for leave and monitor your own leave status.'}</p></div></div>
      <div className="stats-grid">
        <StatCard title="Total" value={leaveSummary.total} note={isAdmin ? 'All leave requests' : 'Your leave requests'} />
        <StatCard title="Pending" value={leaveSummary.pending} note="Awaiting review" />
        <StatCard title="Approved" value={leaveSummary.approved} note="Accepted requests" />
        <StatCard title="Rejected" value={leaveSummary.rejected} note="Declined requests" />
      </div>

      <SectionCard title="Create Leave Request" subtitle={isAdmin ? 'Admin can create a leave request for any employee.' : 'Submit a leave request for your own profile.'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          {isAdmin ? (
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
              <option value="">Select Employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user.full_name}</option>)}
            </select>
          ) : (
            <input value={employees[0]?.user?.full_name || user?.full_name || ''} disabled />
          )}
          <input placeholder="Leave Type" value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} required />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          <textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ minHeight: 90 }} />
          <Button type="submit">Submit Leave</Button>
        </form>
        {error ? <p style={{ color: '#ff9eab' }}>{error}</p> : null}
      </SectionCard>

      <SectionCard title="Leave List" subtitle={isAdmin ? 'Approve, reject, or review current requests.' : 'Your submitted leave requests only.'}>
        <div className="table-wrap">
          {leaveRequests.length === 0 ? <EmptyState compact title="No leave requests yet" description="Create the first leave request to populate this view." icon="🌙" /> : (
            <table className="directory-table">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td><div className="primary-cell"><strong>{employeeMap[leave.employee_id]?.user?.full_name || `Employee #${leave.employee_id}`}</strong><span className="secondary">{employeeMap[leave.employee_id]?.department?.name || 'Employee leave record'}</span></div></td>
                    <td>{leave.leave_type}</td><td>{leave.start_date}</td><td>{leave.end_date}</td><td><span className={`status-pill ${leave.status}`}>{leave.status}</span></td>
                    <td><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {isAdmin ? <>
                        <Button onClick={() => updateStatus(leave.id, 'approved')} variant="success" style={{ padding: '8px 10px' }}>Approve</Button>
                        <Button onClick={() => updateStatus(leave.id, 'rejected')} variant="danger" style={{ padding: '8px 10px' }}>Reject</Button>
                      </> : (leave.status === 'pending' ? <Button onClick={() => deleteLeave(leave.id)} variant="danger" style={{ padding: '8px 10px' }}>Delete</Button> : <span className="secondary">No actions</span>)}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
