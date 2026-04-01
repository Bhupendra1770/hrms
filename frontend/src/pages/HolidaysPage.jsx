import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import SectionCard from '../components/SectionCard'

export default function HolidaysPage() {
  const { user } = useAuth()
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [description, setDescription] = useState('')

  const fetchHolidays = async () => {
    try { const response = await api.get('/holidays'); setHolidays(response.data) } catch (error) { alert('Failed to fetch holidays') } finally { setLoading(false) }
  }
  useEffect(() => { fetchHolidays() }, [])

  const resetForm = () => { setIsFormOpen(false); setEditingId(null); setName(''); setHolidayDate(''); setDescription('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { name, holiday_date: holidayDate, description }
      if (editingId) await api.put(`/holidays/${editingId}`, payload)
      else await api.post('/holidays', payload)
      resetForm(); fetchHolidays()
    } catch (error) { alert(error.response?.data?.detail || 'Failed to save holiday') }
  }

  const handleEdit = (hol) => { setEditingId(hol.id); setName(hol.name); setHolidayDate(hol.holiday_date); setDescription(hol.description || ''); setIsFormOpen(true) }
  const handleDelete = async (id) => { if (!window.confirm('Are you sure you want to delete this holiday?')) return; try { await api.delete(`/holidays/${id}`); fetchHolidays() } catch { alert('Failed to delete holiday') } }
  if (loading) return <p>Loading holidays...</p>

  return (
    <div>
      <div className="page-header"><div><h1>Company Holidays</h1><p>Track upcoming company holidays and festival calendars.</p></div>{user?.role === 'admin' && <Button onClick={() => { if (isFormOpen) resetForm(); else setIsFormOpen(true) }}>{isFormOpen ? 'Cancel' : 'Add Holiday'}</Button>}</div>
      {isFormOpen && <SectionCard title={editingId ? 'Edit Holiday' : 'Add Holiday'} subtitle="Create or update a holiday entry visible across the portal."><form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}><div><label>Holiday Title</label><input required value={name} onChange={(e) => setName(e.target.value)} /></div><div><label>Date</label><input required type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} /></div><div><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div><div style={{ display: 'flex', gap: 10 }}><Button type="submit">{editingId ? 'Update Holiday' : 'Save Holiday'}</Button><Button variant="secondary" onClick={resetForm}>Cancel</Button></div></form></SectionCard>}
      <SectionCard title="Holiday Calendar" subtitle="Upcoming holidays visible to all employees."><div className="table-wrap">{holidays.length === 0 ? <EmptyState compact title="No holidays added yet" description="Add a holiday to start building the company calendar." icon="🎉" /> : (<table className="directory-table"><thead><tr><th>Date</th><th>Holiday Name</th><th>Description</th>{user?.role === 'admin' && <th>Action</th>}</tr></thead><tbody>{holidays.map((hol) => (<tr key={hol.id}><td>{new Date(hol.holiday_date).toLocaleDateString()}</td><td><strong>{hol.name}</strong></td><td><span className="secondary">{hol.description || '-'}</span></td>{user?.role === 'admin' && <td><div style={{ display: 'flex', gap: 8 }}><Button variant="secondary" onClick={() => handleEdit(hol)} style={{ padding: '8px 12px' }}>Edit</Button><Button variant="danger" onClick={() => handleDelete(hol.id)} style={{ padding: '8px 12px' }}>Delete</Button></div></td>}</tr>))}</tbody></table>)}</div></SectionCard>
    </div>
  )
}
