import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Button from '../components/Button'
import SectionCard from '../components/SectionCard'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  full_name: '',
  email: '',
  password: 'Employee@123',
  role: 'employee',
  employee_code: '',
  job_title: '',
  phone: '',
  address: '',
  hire_date: '',
  salary: '',
  status: 'active',
  department_id: '',
}

export default function EmployeesPage() {
  const { isAdmin, user, refreshUser } = useAuth()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editForm, setEditForm] = useState({})
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')

  const loadData = async () => {
    const [employeeRes, departmentRes] = await Promise.all([api.get('/employees'), api.get('/departments')])
    setEmployees(employeeRes.data)
    setDepartments(departmentRes.data)
  }

  useEffect(() => { loadData().catch(() => setError('Failed to load employees')) }, [])

  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const matchesQuery = [employee.user.full_name, employee.user.email, employee.employee_code, employee.job_title].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || String(employee.department?.id) === departmentFilter
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesQuery && matchesDepartment && matchesStatus
  }), [employees, query, departmentFilter, statusFilter])

  const summary = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    admins: employees.filter((e) => e.user.role === 'admin').length,
    departments: new Set(employees.map((e) => e.department?.name).filter(Boolean)).size,
  }), [employees])

  const myEmployee = employees[0]

  const handleCreate = async (event) => {
    event.preventDefault()
    try {
      await api.post('/employees', {
        ...form,
        department_id: form.department_id ? Number(form.department_id) : null,
        salary: form.salary ? Number(form.salary) : null,
      })
      setForm(initialForm)
      loadData()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create employee') }
  }

  const openEdit = (employee) => {
    setEditForm({
      id: employee.id,
      full_name: employee.user.full_name || '',
      email: employee.user.email || '',
      role: employee.user.role || 'employee',
      job_title: employee.job_title || '',
      phone: employee.phone || '',
      address: employee.address || '',
      hire_date: employee.hire_date || '',
      salary: employee.salary || '',
      status: employee.status || 'active',
      department_id: employee.department?.id ? String(employee.department.id) : '',
      is_active: employee.user.is_active,
    })
  }

  const saveEdit = async () => {
    try {
      const payload = isAdmin ? {
        full_name: editForm.full_name,
        email: editForm.email,
        role: editForm.role,
        job_title: editForm.job_title,
        phone: editForm.phone,
        address: editForm.address,
        hire_date: editForm.hire_date,
        salary: editForm.salary ? Number(editForm.salary) : null,
        status: editForm.status,
        department_id: editForm.department_id ? Number(editForm.department_id) : null,
        is_active: editForm.is_active,
      } : {
        full_name: editForm.full_name,
        phone: editForm.phone,
        address: editForm.address,
      }
      await api.put(`/employees/${editForm.id}`, payload)
      await loadData()
      if (!isAdmin) await refreshUser()
      setEditForm({})
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update employee') }
  }

  const deleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee and linked user account?')) return
    try { await api.delete(`/employees/${id}`); loadData() } catch (err) { setError(err.response?.data?.detail || 'Failed to delete employee') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Employees' : 'My Profile'}</h1>
          <p>{isAdmin ? 'Create, update, and manage employee records with role-based access.' : 'View and update your personal employee profile.'}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title={isAdmin ? 'Total Employees' : 'Employee ID'} value={isAdmin ? summary.total : (myEmployee?.employee_code || '-')} note={isAdmin ? 'All people records' : 'Your profile code'} />
        <StatCard title={isAdmin ? 'Active' : 'Department'} value={isAdmin ? summary.active : (myEmployee?.department?.name || '-')} note={isAdmin ? 'Active employees' : 'Your assigned team'} />
        <StatCard title={isAdmin ? 'Admins' : 'Role'} value={isAdmin ? summary.admins : (user?.role || '-')} note={isAdmin ? 'Admin-level accounts' : 'Your access level'} />
        <StatCard title={isAdmin ? 'Departments Covered' : 'Status'} value={isAdmin ? summary.departments : (myEmployee?.status || '-')} note={isAdmin ? 'Distinct departments' : 'Employment status'} />
      </div>

      {isAdmin ? (
        <SectionCard title="Add Employee" subtitle="Admin can create users, assign roles, and map them to departments.">
          <form onSubmit={handleCreate} className="form-grid">
            <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <input placeholder="Employee Code" value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} required />
            <input placeholder="Job Title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} required />
            <input placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div><Button type="submit">Create Employee</Button></div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title={isAdmin ? 'Employee Directory' : 'Profile Details'} subtitle={isAdmin ? 'Admin can update or delete employee records. Employees can only update their own contact details.' : 'You can update your full name, phone, and address.'}>
        {isAdmin ? (
          <>
            <div className="section-actions">
              <input placeholder="Search by name, email, code, or title" value={query} onChange={(e) => setQuery(e.target.value)} />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}><option value="all">All Departments</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
            <div className="table-wrap">
              {filteredEmployees.length === 0 ? <EmptyState compact title="No employees found" description="Try changing filters or add a new employee." icon="👥" /> : (
                <table className="directory-table">
                  <thead><tr><th>Name</th><th>Code</th><th>Job Title</th><th>Department</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td><div className="primary-cell"><strong>{employee.user.full_name}</strong><span className="secondary">{employee.user.email}</span></div></td>
                        <td>{employee.employee_code}</td><td>{employee.job_title}</td><td>{employee.department?.name || '-'}</td>
                        <td><span className={`role-pill ${employee.user.role}`}>{employee.user.role}</span></td>
                        <td><span className={`status-pill ${employee.status}`}>{employee.status}</span></td>
                        <td><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Button variant="secondary" onClick={() => openEdit(employee)}>Edit</Button><Button variant="danger" onClick={() => deleteEmployee(employee.id)}>Delete</Button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          myEmployee ? (
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <input placeholder="Full Name" value={editForm.full_name ?? myEmployee.user.full_name} onChange={(e) => setEditForm({ ...editForm, id: myEmployee.id, full_name: e.target.value, phone: editForm.phone ?? myEmployee.phone ?? '', address: editForm.address ?? myEmployee.address ?? '' })} />
              <input value={myEmployee.user.email} disabled />
              <input value={myEmployee.employee_code} disabled />
              <input value={myEmployee.job_title} disabled />
              <input placeholder="Phone" value={editForm.phone ?? myEmployee.phone ?? ''} onChange={(e) => setEditForm({ ...editForm, id: myEmployee.id, full_name: editForm.full_name ?? myEmployee.user.full_name, phone: e.target.value, address: editForm.address ?? myEmployee.address ?? '' })} />
              <input placeholder="Address" value={editForm.address ?? myEmployee.address ?? ''} onChange={(e) => setEditForm({ ...editForm, id: myEmployee.id, full_name: editForm.full_name ?? myEmployee.user.full_name, phone: editForm.phone ?? myEmployee.phone ?? '', address: e.target.value })} />
              <input value={myEmployee.department?.name || '-'} disabled />
              <div><Button onClick={saveEdit}>Save My Details</Button></div>
            </div>
          ) : <EmptyState compact title="No employee profile found" description="Ask admin to create your employee profile first." icon="👤" />
        )}
        {error ? <p style={{ color: '#ff9eab' }}>{error}</p> : null}
      </SectionCard>

      {isAdmin && editForm.id ? (
        <SectionCard title="Edit Employee" subtitle="Update record details, role, status, or department.">
          <div className="form-grid">
            <input placeholder="Full Name" value={editForm.full_name || ''} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            <input placeholder="Email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <select value={editForm.role || 'employee'} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select>
            <select value={String(editForm.is_active)} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}><option value="true">Active User</option><option value="false">Inactive User</option></select>
            <input placeholder="Job Title" value={editForm.job_title || ''} onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })} />
            <input placeholder="Phone" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <input placeholder="Address" value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            <input type="date" value={editForm.hire_date || ''} onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })} />
            <input placeholder="Salary" value={editForm.salary || ''} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
            <select value={editForm.department_id || ''} onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}><option value="">Select Department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <select value={editForm.status || 'active'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select>
            <div style={{ display: 'flex', gap: 10 }}><Button onClick={saveEdit}>Save Changes</Button><Button variant="secondary" onClick={() => setEditForm({})}>Cancel</Button></div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
