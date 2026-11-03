import { Link } from "react-router-dom";

const CTA_STYLES = {
  primary: "bg-pine-700 group-hover:bg-pine-800 text-white shadow-md",
  secondary: "bg-white group-hover:bg-cream-50 text-brand-strong border border-gold-400/50 shadow-sm",
};

/**
 * Tarjeta de acceso del inicio. Toda la tarjeta es un único elemento
 * interactivo (link o botón); el "botón" interior es solo visual.
 */
export default function ActionCard({ icon, iconBg = "bg-amber-100", badge, title, description, cta, ctaVariant = "secondary", to, onClick, disabled = false, highlight = false }) {
  const className = [
    "group h-full w-full p-5 sm:p-6 text-left flex flex-col justify-between bg-cream-100 rounded-[var(--radius-card)]",
    "shadow-[var(--shadow-card)] border-2 transition-all duration-200 hover:-translate-y-1",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300",
    highlight ? "border-pine-700/40 hover:border-pine-700" : "border-gold-400/30 hover:border-gold-500",
  ].join(" ");

  const content = (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span aria-hidden="true" className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-2xl shadow-inner`}>
            {icon}
          </span>
          {badge}
        </div>
        <h3 className="font-festive font-bold text-xl text-brand-strong leading-snug">{title}</h3>
        <p className="text-sm font-semibold text-ink-soft leading-relaxed">{description}</p>
      </div>
      <div className="mt-5 pt-3 border-t border-gold-400/20">
        <span className={`w-full py-2.5 px-4 rounded-full font-festive font-bold text-sm inline-flex items-center justify-center gap-1.5 transition-all ${CTA_STYLES[ctaVariant]}`}>
          {cta}
        </span>
      </div>
    </>
  );

  return to ? (
    <Link to={to} className={className}>{content}</Link>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} aria-busy={disabled} className={`${className} disabled:cursor-wait`}>{content}</button>
  );
}
