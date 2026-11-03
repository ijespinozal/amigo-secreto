const TONES = {
  gold: "bg-gold-400/30 text-amber-900",
  green: "bg-emerald-100 text-pine-800",
  red: "bg-red-100 text-red-900",
  blue: "bg-blue-100 text-blue-800",
  gray: "bg-stone-200/70 text-stone-700",
  brand: "bg-brand-soft text-brand-strong",
  // Opaca: para usar directamente sobre el fondo oscuro de la página.
  cream: "bg-cream-100 text-amber-900 shadow-sm",
};

/** Etiqueta en forma de píldora. */
export default function Badge({ tone = "gold", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-festive font-bold text-xs whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
