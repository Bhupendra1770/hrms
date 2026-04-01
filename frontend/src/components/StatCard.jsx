export default function StatCard({ title, value, note = null }) {
  return (
    <div className="stat-card">
      <div className="label">{title}</div>
      <div className="value">{value}</div>
      {note ? <div className="note">{note}</div> : null}
    </div>
  )
}
