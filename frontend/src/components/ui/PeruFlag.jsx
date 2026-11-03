/**
 * Bandera del Perú en SVG. Se usa en vez del emoji 🇵🇪 porque Windows no
 * dibuja emojis de banderas (muestra "PE").
 */
export default function PeruFlag({ className = "w-5 h-3.5" }) {
  return (
    <svg viewBox="0 0 3 2" className={`${className} rounded-[2px] shadow-sm shrink-0`} aria-hidden="true">
      <rect width="1" height="2" x="0" fill="#D91023" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#D91023" />
    </svg>
  );
}
