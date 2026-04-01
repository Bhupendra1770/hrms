import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/client'
import ChartCard from '../components/ChartCard'
import EmptyState from '../components/EmptyState'
import SectionCard from '../components/SectionCard'
import StatCard from '../components/StatCard'

const COLORS = ['#7c5cff', '#af52ff', '#14d5c0', '#ffb84d', '#ff6b7a', '#38bdf8']

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/dashboard/analytics')
      .then((response) => setAnalytics(response.data))
      .catch(() => setError('Failed to load reports'))
  }, [])

  const kpis = useMemo(() => analytics?.kpis || [], [analytics])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports & Insights</h1>
          <p>See hiring movement, leave patterns, department strength, and attendance behavior in one view.</p>
        </div>
        <div className="info-chip">Analytics workspace</div>
      </div>

      <div className="kpi-grid">
        {kpis.length === 0 ? (
          <EmptyState compact title="No KPI data available" description="Add employees, leaves, and attendance records to generate reports." icon="◎" />
        ) : kpis.map((item) => (
          <StatCard key={item.label} title={item.label} value={item.value} note={item.note} />
        ))}
      </div>

      <div className="chart-grid">
        <ChartCard title="Department Headcount" subtitle="Employee distribution across teams">
          {(analytics?.department_headcount || []).length === 0 ? <EmptyState compact title="No headcount data" description="Department distribution appears after employee mapping." icon="▦" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics?.department_headcount || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#9eb0d1' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#9eb0d1' }} />
                <Tooltip contentStyle={{ background: '#121a33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#edf2ff' }} />
                <Bar dataKey="employees" radius={[10, 10, 0, 0]} fill="#5b5cf0" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Leave Status Breakdown" subtitle="Approved vs pending vs rejected requests">
          {(analytics?.leave_status_breakdown || []).length === 0 ? <EmptyState compact title="No leave history yet" description="Once leave requests are raised, the breakdown appears here." icon="☾" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics?.leave_status_breakdown || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                  {(analytics?.leave_status_breakdown || []).map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#121a33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#edf2ff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Hiring Trend" subtitle="Employees added in the last 6 months">
          {(analytics?.monthly_hires || []).length === 0 ? <EmptyState compact title="No hiring trend yet" description="Employee onboarding dates will power this trend line." icon="↗" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics?.monthly_hires || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9eb0d1' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#9eb0d1' }} />
                <Tooltip contentStyle={{ background: '#121a33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#edf2ff' }} />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Attendance Trend" subtitle="Present employees across the last 7 days">
          {(analytics?.attendance_trend || []).length === 0 ? <EmptyState compact title="No attendance trend" description="Start logging attendance to see week-over-week patterns." icon="◌" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics?.attendance_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9eb0d1' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#9eb0d1' }} />
                <Tooltip contentStyle={{ background: '#121a33', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#edf2ff' }} />
                <Line type="monotone" dataKey="present_count" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="two-col-grid">
        <SectionCard title="Average Salary by Department" subtitle="Useful for budget and team planning.">
          {(analytics?.salary_by_department || []).length === 0 ? (
            <EmptyState compact title="No salary analytics yet" description="Salary summaries will appear once employee salaries are available." icon="₹" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Employees</th>
                    <th>Average Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.salary_by_department || []).map((item) => (
                    <tr key={item.department}>
                      <td>{item.department}</td>
                      <td>{item.employees}</td>
                      <td>{item.average_salary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Leave Requests" subtitle="Latest requests that may require review.">
          {(analytics?.recent_leaves || []).length === 0 ? (
            <EmptyState compact title="No recent leave requests" description="New leave requests will show here for quick review." icon="✦" />
          ) : (
            <div className="soft-list">
              {(analytics?.recent_leaves || []).map((leave) => (
                <div key={leave.id} className="soft-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>{leave.employee_name}</strong>
                    <span style={{ color: '#d7e0f7', textTransform: 'capitalize' }}>{leave.status}</span>
                  </div>
                  <div style={{ color: '#9eb0d1', fontSize: 14, marginTop: 4 }}>{leave.leave_type}</div>
                  <div style={{ color: '#9eb0d1', fontSize: 13, marginTop: 4 }}>
                    {leave.start_date} to {leave.end_date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </div>
  )
}
