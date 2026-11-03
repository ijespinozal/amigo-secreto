/** Tarjeta de bienvenida de las pantallas de acceso (login / registro). */
export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="flex justify-center py-4 sm:py-10 animate-fade-in-up">
      <div className="w-full max-w-[450px] bg-cream-100 rounded-3xl shadow-2xl p-7 sm:p-9 relative border-4 border-amber-100/70 overflow-hidden">
        {/* Cinta de colores y adornos */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-gold-500 via-red-700 to-pine-700" />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-gold-500/30 to-transparent rounded-full pointer-events-none" />
        <div className="absolute top-3 right-4 select-none opacity-85 text-xl" aria-hidden="true">🎄✨</div>

        <div className="flex flex-col items-center text-center mb-6 pt-1">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-100 to-amber-200/80 border-2 border-gold-500 flex items-center justify-center shadow-inner mb-3">
            <span className="text-3xl" aria-hidden="true">🎁</span>
          </div>
          <h1 className="font-festive font-bold text-3xl sm:text-[32px] text-brand-strong tracking-tight">{title}</h1>
          {subtitle && (
            <p className="font-semibold text-stone-600 text-sm sm:text-[15px] mt-2 leading-snug max-w-[310px]">{subtitle}</p>
          )}
        </div>

        {children}

        {footer && <p className="text-center mt-5 font-semibold text-stone-600 text-sm">{footer}</p>}
      </div>
    </div>
  );
}
