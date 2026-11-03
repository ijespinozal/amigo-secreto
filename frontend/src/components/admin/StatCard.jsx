/** Indicador numérico compacto (resúmenes del panel de administración). */
export default function StatCard({ icon, value, label }) {
  return (
    <div className="min-w-0 flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left bg-cream-100/95 rounded-[var(--radius-card)] border-2 border-gold-400/40 shadow-sm px-2 sm:px-4 py-3">
      <span aria-hidden="true" className="text-xl sm:text-2xl">{icon}</span>
      <div className="min-w-0">
        <p className="font-festive font-bold text-2xl text-brand leading-none tabular-nums">{value}</p>
        <p className="text-[10px] sm:text-xs font-bold text-ink-soft uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  );
}
