export default function ChartCard({ title, subtitle, children, actions = null }) {
  return (
    <div className="section-card" style={{ marginBottom: 0 }}>
      <div className="section-title" style={{ marginBottom: 18 }}>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="chart-surface">{children}</div>
    </div>
  )
}
