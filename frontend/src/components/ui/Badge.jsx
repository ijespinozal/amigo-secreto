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

/**
 * Etiqueta en forma de píldora.
 * @param {boolean} [wrap] permite varias líneas (textos largos en celular)
 */
export default function Badge({ tone = "gold", wrap = false, className = "", children }) {
  const layout = wrap ? "whitespace-normal text-center rounded-2xl" : "whitespace-nowrap rounded-full";
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-3 py-1 font-festive font-bold text-xs ${layout} ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
