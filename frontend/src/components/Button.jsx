export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  style = {},
}) {
  const variants = {
    primary: { background: "#2563eb", color: "#ffffff", border: "1px solid #2563eb" },
    secondary: { background: "#ffffff", color: "#344054", border: "1px solid #d0d5dd" },
    success: { background: "#039855", color: "#ffffff", border: "1px solid #039855" },
    danger: { background: "#dc2626", color: "#ffffff", border: "1px solid #dc2626" },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 10,
        padding: "10px 16px",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "0.2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  )
}
