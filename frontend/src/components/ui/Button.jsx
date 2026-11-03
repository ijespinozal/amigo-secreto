import { Link } from "react-router-dom";

const VARIANTS = {
  primary: "bg-pine-700 hover:bg-pine-800 text-white border border-pine-800/30 shadow-md hover:shadow-lg",
  secondary: "bg-white hover:bg-cream-50 text-brand-strong border border-gold-400/60 shadow-sm hover:shadow",
  danger: "bg-red-700 hover:bg-red-800 text-white shadow-md",
  gold: "bg-gold-500 hover:bg-gold-400 text-brand-strong shadow-md",
  neutral: "bg-stone-500 hover:bg-stone-600 text-white shadow-md",
  warning: "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-sm",
  ghost: "bg-transparent hover:bg-black/5 text-brand-strong",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-full gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-full gap-2",
  lg: "px-6 py-3.5 text-lg rounded-xl gap-2",
};

/**
 * Botón del sistema de diseño. Con `to` se renderiza como <Link>.
 * @param {"primary"|"secondary"|"danger"|"gold"|"neutral"|"warning"|"ghost"} [variant]
 * @param {"sm"|"md"|"lg"} [size]
 * @param {boolean} [block] ancho completo
 */
export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  to,
  className = "",
  children,
  type = "button",
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center font-festive font-bold tracking-wide transition-all",
    "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-300",
    block ? "w-full" : "w-auto",
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
