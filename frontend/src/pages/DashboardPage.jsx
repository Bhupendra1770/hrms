import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../api/client'
import ActivityHeatmap from '../components/ActivityHeatmap'
import ChartCard from '../components/ChartCard'
import EmptyState from '../components/EmptyState'
import SectionCard from '../components/SectionCard'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const axisStyle = { fontSize: 12, fill: '#9eb0d1' }
const gridStroke = 'rgba(255,255,255,0.08)'
const tooltipStyle = { background: '#121a33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#edf2ff' }

export default function DashboardPage() {
  const { isAdmin, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(true)
  const [announcements, setAnnouncements] = useState([])
  const [holidays, setHolidays] = useState([])
  const [myEmployees, setMyEmployees] = useState([])
  const [myLeaves, setMyLeaves] = useState([])
  const [myAttendance, setMyAttendance] = useState([])

  useEffect(() => {
    api.get('/dashboard/stats').then((response) => setStats(response.data))
    if (isAdmin) api.get('/dashboard/analytics').then((response) => setAnalytics(response.data)).catch(() => {})
    api.get('/dashboard/heatmap').then((response) => { setHeatmapData(response.data); setIsHeatmapLoading(false) }).catch(() => setIsHeatmapLoading(false))
    api.get('/announcements').then((res) => setAnnouncements(res.data.slice(0, 3))).catch(() => {})
    api.get('/holidays').then((res) => setHolidays(res.data.slice(0, 4))).catch(() => {})
    if (!isAdmin) {
      api.get('/employees').then((res) => setMyEmployees(res.data)).catch(() => {})
      api.get('/leaves').then((res) => setMyLeaves(res.data)).catch(() => {})
      api.get('/attendance').then((res) => setMyAttendance(res.data)).catch(() => {})
    }
  }, [isAdmin])

  const completionRate = useMemo(() => {
    const total = Number(stats?.total_employees || 0)
    const active = Number(stats?.active_employees || 0)
    if (!total) return 0
    return Math.round((active / total) * 100)
  }, [stats])

  const myEmployee = myEmployees[0]
  const myPendingLeaves = myLeaves.filter((leave) => leave.status === 'pending').length
  const myApprovedLeaves = myLeaves.filter((leave) => leave.status === 'approved').length
  const myTodayAttendance = myAttendance.find((row) => row.attendance_date === new Date().toISOString().split('T')[0])

  return (
    <div>
      <div className="hero-panel">
        <div className="hero-content">
          <div>
            <div className="info-chip">{isAdmin ? 'HRMS overview' : 'Employee workspace'}</div>
            <h1 className="hero-title">{isAdmin ? 'Workforce dashboard' : `Welcome, ${user?.full_name || 'employee'}`}</h1>
            <p className="hero-copy">{isAdmin ? 'Monitor employees, attendance, departments, leave approvals, holidays, and announcements from one clear operational view.' : 'Track your attendance, apply for leave, and stay updated with announcements and upcoming holidays.'}</p>
            <div className="hero-pills">
              {isAdmin ? <>
                <span className="hero-pill">Attendance tracking</span><span className="hero-pill">Department visibility</span><span className="hero-pill">Leave and HR updates</span>
              </> : <>
                <span className="hero-pill">My attendance</span><span className="hero-pill">My leaves</span><span className="hero-pill">Company updates</span>
              </>}
            </div>
          </div>
          <div className="hero-side">
            <div className="mini-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div className="label">{isAdmin ? 'Active workforce ratio' : 'My pending leaves'}</div>
                <div className="value">{isAdmin ? `${completionRate}%` : myPendingLeaves}</div>
                <div style={{ color: '#9fb0d4', fontSize: 13 }}>{isAdmin ? 'Based on active employee records' : 'Requests awaiting review'}</div>
              </div>
              <div className="metric-ring"><span>{isAdmin ? `${completionRate}%` : myApprovedLeaves}</span></div>
            </div>
            <div className="mini-panel">
              <div className="label">{isAdmin ? 'Today summary' : 'Today attendance'}</div>
              <div className="value" style={{ fontSize: 24 }}>{isAdmin ? `${stats?.today_present ?? 0} present / ${stats?.pending_leaves ?? 0} pending` : (myTodayAttendance ? 'Marked' : 'Not marked')}</div>
              <div style={{ color: '#9fb0d4', fontSize: 13, marginTop: 6 }}>{isAdmin ? 'Quick view of attendance and pending approvals.' : 'Check the attendance page for detailed timings.'}</div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="stats-grid">
            <StatCard title="Employees" value={stats?.total_employees ?? '-'} note="Total people in the system" />
            <StatCard title="Active Employees" value={stats?.active_employees ?? '-'} note="Currently active records" />
            <StatCard title="Departments" value={stats?.total_departments ?? '-'} note="Teams represented" />
            <StatCard title="Today Present" value={stats?.today_present ?? '-'} note="Attendance marked today" />
            <StatCard title="Leaves" value={stats?.total_leaves ?? '-'} note="Total leave records" />
            <StatCard title="Pending Leaves" value={stats?.pending_leaves ?? '-'} note="Awaiting action" />
          </div>

          <div className="two-col-grid">
            <ActivityHeatmap data={heatmapData} isLoading={isHeatmapLoading} />
            <SectionCard title="Quick Insights" subtitle="High-level pulse checks from the latest data.">
              <div style={{ display: 'grid', gap: 12 }}>
                <InsightRow label="Upcoming Holidays" value={stats?.upcoming_holidays ?? 0} helper="Planned in the next 30 days" />
                <InsightRow label="Announcements" value={stats?.recent_announcements ?? 0} helper="Recent company-wide updates" />
                <InsightRow label="Inactive Employees" value={stats?.inactive_employees ?? 0} helper="Needs profile review" />
                <InsightRow label="Attendance Records" value={stats?.total_attendance_records ?? 0} helper="All logged check-ins so far" />
              </div>
            </SectionCard>
          </div>

          <div className="chart-grid">
            <ChartCard title="Department Headcount" subtitle="Top-level distribution across teams">
              {(analytics?.department_headcount || []).length === 0 ? <EmptyState compact title="No department data" description="Once departments and employees are created, headcount will appear here." icon="▦" /> : (
                <ResponsiveContainer width="100%" height={280}><BarChart data={analytics?.department_headcount || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} /><XAxis dataKey="department" tick={axisStyle} /><YAxis allowDecimals={false} tick={axisStyle} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="employees" fill="url(#barGradient)" radius={[12, 12, 0, 0]} /><defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" /><stop offset="100%" stopColor="#14d5c0" /></linearGradient></defs></BarChart></ResponsiveContainer>
              )}
            </ChartCard>
            <ChartCard title="Attendance Trend" subtitle="Present employees over the last 7 days">
              {(analytics?.attendance_trend || []).length === 0 ? <EmptyState compact title="No attendance trend yet" description="Start logging attendance to unlock this chart." icon="◌" /> : (
                <ResponsiveContainer width="100%" height={280}><LineChart data={analytics?.attendance_trend || []}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} /><XAxis dataKey="date" tick={axisStyle} /><YAxis allowDecimals={false} tick={axisStyle} /><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="present_count" stroke="#14d5c0" strokeWidth={3} dot={{ r: 4, stroke: '#0f172a', strokeWidth: 2 }} /></LineChart></ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      ) : (
        <div className="two-col-grid">
          <ActivityHeatmap data={heatmapData} isLoading={isHeatmapLoading} />
          <SectionCard title="My Summary" subtitle="A quick view of your personal HR activity.">
            <div style={{ display: 'grid', gap: 12 }}>
              <InsightRow label="Employee Code" value={myEmployee?.employee_code || '-'} helper={myEmployee?.job_title || 'Profile details'} />
              <InsightRow label="Department" value={myEmployee?.department?.name || '-'} helper="Assigned team" />
              <InsightRow label="Pending Leaves" value={myPendingLeaves} helper="Awaiting manager/admin review" />
              <InsightRow label="Attendance Entries" value={myAttendance.length} helper="Your logged attendance history" />
            </div>
          </SectionCard>
        </div>
      )}

      <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <SectionCard title="Company Announcements" subtitle="Most recent communication shared across the organization.">
          {announcements.length === 0 ? <EmptyState compact title="No announcements yet" description="Admins can post announcements to keep everyone aligned." icon="✦" /> : <div className="soft-list">{announcements.map((ann) => (<div key={ann.id} className="soft-item"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 10 }}><h4 style={{ margin: 0, fontSize: '1rem' }}>{ann.title}</h4>{ann.priority === 'high' ? <span className="priority-pill high">High priority</span> : <span className="priority-pill normal">Normal</span>}</div><p style={{ margin: 0, color: '#d7e0f7' }}>{ann.content}</p></div>))}</div>}
        </SectionCard>
        <SectionCard title="Upcoming Holidays" subtitle="Key dates to plan around.">
          {holidays.length === 0 ? <EmptyState compact title="No holidays scheduled" description="Admins can add holidays to make them visible here." icon="✺" /> : <div className="soft-list">{holidays.map((hol) => (<div key={hol.id} className="soft-item"><div style={{ fontWeight: 700, marginBottom: 6 }}>{hol.name}</div><div style={{ color: '#edf2ff', fontSize: 14 }}>{new Date(hol.holiday_date).toLocaleDateString()}</div>{hol.description ? <div style={{ color: '#9eb0d1', fontSize: 14, marginTop: 4 }}>{hol.description}</div> : null}</div>))}</div>}
        </SectionCard>
      </div>
    </div>
  )
}

function InsightRow({ label, value, helper }) {
  return <div className="insight-row"><div><div style={{ fontWeight: 700 }}>{label}</div><div style={{ fontSize: 13, color: '#9eb0d1', marginTop: 4 }}>{helper}</div></div><div className="value">{value}</div></div>
}
