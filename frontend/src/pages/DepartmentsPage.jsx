import { useEffect, useState } from 'react'
import api from '../api/client'
import SectionCard from '../components/SectionCard'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const loadDepartments = () => api.get('/departments').then((response) => setDepartments(response.data))

  useEffect(() => {
    loadDepartments().catch(() => setError('Failed to load departments'))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await api.post('/departments', { name, description })
      setName('')
      setDescription('')
      loadDepartments()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create department')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Create and manage company departments and their descriptions.</p>
        </div>
      </div>
      <SectionCard title="Create Department" subtitle="Add a new department to organize employees.">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department Name" required />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ minHeight: 100 }} />
          <div><Button type="submit">Add Department</Button></div>
        </form>
        {error ? <p style={{ color: '#ff9eab' }}>{error}</p> : null}
      </SectionCard>
      <SectionCard title="Department List" subtitle="Overview of configured departments.">
        {departments.length === 0 ? (
          <EmptyState compact title="No departments added yet" description="Create a department to start grouping employees." icon="🏢" />
        ) : (
          <div className="soft-list">
            {departments.map((department) => (
              <div key={department.id} className="soft-item">
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{department.name}</div>
                <div style={{ color: '#9eb0d1' }}>{department.description || 'No description'}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
