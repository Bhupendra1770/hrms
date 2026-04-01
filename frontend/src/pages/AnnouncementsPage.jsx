import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('normal')

  const fetchAnnouncements = async () => {
    try { const response = await api.get('/announcements'); setAnnouncements(response.data) } catch { alert('Failed to fetch announcements') } finally { setLoading(false) }
  }
  useEffect(() => { fetchAnnouncements() }, [])
  const resetForm = () => { setIsFormOpen(false); setEditingId(null); setTitle(''); setContent(''); setPriority('normal') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { title, content, priority }
      if (editingId) await api.put(`/announcements/${editingId}`, payload)
      else await api.post('/announcements', payload)
      resetForm(); fetchAnnouncements()
    } catch (error) { alert(error.response?.data?.detail || 'Failed to save announcement') }
  }
  const handleEdit = (ann) => { setEditingId(ann.id); setTitle(ann.title); setContent(ann.content); setPriority(ann.priority || 'normal'); setIsFormOpen(true) }
  const handleDelete = async (id) => { if (!window.confirm('Are you sure you want to delete this announcement?')) return; try { await api.delete(`/announcements/${id}`); fetchAnnouncements() } catch { alert('Failed to delete announcement') } }
  if (loading) return <p>Loading announcements...</p>

  return (
    <div>
      <div className="page-header"><div><h1>Announcements</h1><p>Company-wide communication and updates for employees.</p></div>{user?.role === 'admin' && <Button onClick={() => { if (isFormOpen) resetForm(); else setIsFormOpen(true) }}>{isFormOpen ? 'Cancel' : 'Post Announcement'}</Button>}</div>
      {isFormOpen && <div className="section-card form-card"><div className="section-title"><div><h3>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3><p>Share updates, policy changes, and notices with the team.</p></div></div><form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}><div><label>Title</label><input required value={title} onChange={(e) => setTitle(e.target.value)} /></div><div><label>Content</label><textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={5} /></div><div><label>Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="normal">Normal</option><option value="high">High</option></select></div><div style={{ display: 'flex', gap: 10 }}><Button type="submit">{editingId ? 'Update Announcement' : 'Publish Announcement'}</Button><Button variant="secondary" onClick={resetForm}>Cancel</Button></div></form></div>}
      <div className="list-grid">{announcements.length === 0 ? <EmptyState title="No announcements found" description="Create the first announcement to keep everyone informed." icon="📢" /> : announcements.map((ann) => (<div key={ann.id} className="announcement-card"><div className="announcement-head"><div><h3 className="announcement-title">{ann.title}</h3><div className="announcement-meta">Posted: {new Date(ann.created_at).toLocaleString()}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className={`priority-pill ${ann.priority}`}>{ann.priority}</span>{user?.role === 'admin' && <><Button variant="secondary" onClick={() => handleEdit(ann)} style={{ padding: '8px 12px' }}>Edit</Button><Button variant="danger" onClick={() => handleDelete(ann.id)} style={{ padding: '8px 12px' }}>Delete</Button></>}</div></div><p style={{ margin: 0, color: '#d9e2fa', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{ann.content}</p></div>))}</div>
    </div>
  )
}
