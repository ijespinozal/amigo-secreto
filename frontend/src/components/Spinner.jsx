const SIZES = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-14 h-14 border-4",
};

/**
 * Indicador de carga en línea (anillo dorado). Es decorativo: quien lo usa
 * debe anunciar el estado (p. ej. role="status" en PageLoading).
 * @param {"sm"|"md"|"lg"} [size]
 */
export default function Spinner({ size = "md", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border-gold-400/30 border-t-gold-400 animate-spin ${SIZES[size]} ${className}`}
    />
  );
}
