export default function EmptyState({
  title = 'Nothing to show yet',
  description = 'Data will appear here once records are added.',
  icon = '∿',
  compact = false,
  cta = 'Add records to bring this section to life',
}) {
  return (
    <div className="empty-state" style={compact ? { minHeight: 180 } : undefined}>
      <div>
        <div className="empty-state__icon">{icon}</div>
        <h4>{title}</h4>
        <p>{description}</p>
        {cta ? <div className="empty-state__cta">{cta}</div> : null}
      </div>
    </div>
  )
}
