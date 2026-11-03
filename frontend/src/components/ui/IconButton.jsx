const TONES = {
  default: "bg-cream-100 hover:bg-gold-400/30 border-gold-400/50",
  danger: "bg-red-50 hover:bg-red-100 border-red-200",
};

/** Botón cuadrado con un ícono. `label` es obligatorio (accesibilidad y tooltip). */
export default function IconButton({ label, tone = "default", className = "", children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`w-9 h-9 p-0 rounded-xl border text-base flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300 ${TONES[tone]} ${className}`}
      {...props}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
