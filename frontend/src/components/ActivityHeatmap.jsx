import EmptyState from './EmptyState'

const STATUS_COLORS = {
  present: '#14d5c0',
  leave: '#ffb84d',
  absent: '#ff6b7a',
  weekend: '#3c4a6d',
  na: '#24324f',
  empty: 'transparent'
}

const STATUS_LABELS = {
  present: 'Present',
  leave: 'On Leave',
  absent: 'Absent',
  weekend: 'Weekend',
  na: 'No record'
}

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DEMO_BARS = [52, 72, 64, 86, 68, 42, 58]

export default function ActivityHeatmap({ data, isLoading }) {
  if (isLoading) {
    return <div className="section-card" style={{ display: 'grid', placeItems: 'center', minHeight: 260 }}>Loading activity heatmap...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="section-card" style={{ marginBottom: 0 }}>
        <div className="section-title">
          <div>
            <h3>Activity Overview</h3>
            <p>Attendance intensity for the last 7 days.</p>
          </div>
          <span className="info-chip">Starter view</span>
        </div>

        <div className="heatmap-shell">
          <div className="heatmap-summary">
            <div className="mini">
              <div style={{ color: '#9eb0d1', fontSize: 13 }}>Expected activity</div>
              <div className="n">76%</div>
            </div>
            <div className="mini">
              <div style={{ color: '#9eb0d1', fontSize: 13 }}>Best day</div>
              <div className="n">Thu</div>
            </div>
            <div className="mini">
              <div style={{ color: '#9eb0d1', fontSize: 13 }}>Focus</div>
              <div className="n">Log more attendance</div>
            </div>
          </div>

          <div>
            <div className="heatmap-fallback-bars">
              {DEMO_BARS.map((value, idx) => (
                <div key={WEEK_LABELS[idx]}>
                  <div className="heatmap-fallback-bar" style={{ height: `${value + 25}px` }} />
                  <div className="heatmap-fallback-label">{WEEK_LABELS[idx]}</div>
                </div>
              ))}
            </div>
          </div>

          <EmptyState
            compact
            title="Your visual activity panel is ready"
            description="The live heatmap will automatically replace this preview as soon as more attendance days are recorded."
            icon="✦"
            cta="Tip: log attendance for multiple dates to unlock the real heatmap"
          />
        </div>
      </div>
    )
  }

  const firstDate = new Date(data[0].date)
  const firstDayOfWeek = firstDate.getDay()
  const emptyCellsCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const emptyCells = Array.from({ length: emptyCellsCount }, (_, i) => (
    <div key={`empty-${i}`} style={{ width: 14, height: 14, backgroundColor: STATUS_COLORS.empty }} />
  ))

  const counts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="section-card" style={{ marginBottom: 0 }}>
      <div className="section-title">
        <div>
          <h3>Activity Heatmap</h3>
          <p>Recent 180-day attendance footprint.</p>
        </div>
        <span className="info-chip">Last 180 days</span>
      </div>

      <div className="heatmap-shell">
        <div className="heatmap-summary">
          <div className="mini">
            <div style={{ color: '#9eb0d1', fontSize: 13 }}>Present days</div>
            <div className="n">{counts.present || 0}</div>
          </div>
          <div className="mini">
            <div style={{ color: '#9eb0d1', fontSize: 13 }}>Leaves</div>
            <div className="n">{counts.leave || 0}</div>
          </div>
          <div className="mini">
            <div style={{ color: '#9eb0d1', fontSize: 13 }}>Absences</div>
            <div className="n">{counts.absent || 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 14px)', gap: 4, fontSize: '0.75rem', color: '#9eb0d1', paddingTop: 4 }}>
            <div>Mon</div>
            <div style={{ visibility: 'hidden' }}>Tue</div>
            <div>Wed</div>
            <div style={{ visibility: 'hidden' }}>Thu</div>
            <div>Fri</div>
            <div style={{ visibility: 'hidden' }}>Sat</div>
            <div style={{ visibility: 'hidden' }}>Sun</div>
          </div>

          <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, 14px)', gap: 4 }}>
            {emptyCells}
            {data.map((item) => (
              <div
                key={item.date}
                title={`${item.date} — ${STATUS_LABELS[item.status]}`}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: STATUS_COLORS[item.status],
                  boxShadow: item.status === 'present' ? '0 0 0 1px rgba(20,213,192,0.18)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 4, color: '#9eb0d1', fontSize: 13 }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: STATUS_COLORS[key], display: 'inline-block' }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
