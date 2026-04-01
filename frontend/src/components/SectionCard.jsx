export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="section-card">
      {(title || right) ? (
        <div className="section-title">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  )
}
