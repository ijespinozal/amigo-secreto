/**
 * Tarjeta crema del sistema de diseño.
 * @param {ReactNode} [title]
 * @param {ReactNode} [actions] contenido a la derecha del título
 */
export default function Card({ title, actions, className = "", children }) {
  return (
    <section
      className={`bg-cream-100 rounded-[var(--radius-panel)] p-5 sm:p-7 shadow-[var(--shadow-cozy)] border-2 border-gold-400/40 w-full ${className}`}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {title && (
            <h3 className="font-festive font-bold text-xl sm:text-2xl text-brand-strong tracking-tight">{title}</h3>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
