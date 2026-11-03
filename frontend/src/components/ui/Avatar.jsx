const COLORS = ["bg-red-800", "bg-pine-700", "bg-gold-600", "bg-[#8E2800]", "bg-sky-800", "bg-purple-800"];

const initialsOf = (firstName = "", lastName = "") =>
  `${firstName.trim()[0] ?? ""}${lastName?.trim()[0] ?? ""}`.toUpperCase() || "?";

// Color estable por persona: el mismo nombre siempre obtiene el mismo color.
const colorOf = (seed) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
};

/** Avatar con iniciales (la app no guarda fotos de perfil). */
export default function Avatar({ firstName, lastName, size = "md", className = "" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
  return (
    <span
      aria-hidden="true"
      className={`${sizes[size]} ${colorOf(`${firstName}${lastName}`)} shrink-0 rounded-full text-cream-100 font-festive font-bold flex items-center justify-center shadow-sm ${className}`}
    >
      {initialsOf(firstName, lastName)}
    </span>
  );
}
