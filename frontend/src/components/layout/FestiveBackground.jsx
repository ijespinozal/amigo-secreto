// Decoración de fondo: luces difusas (bokeh) y nieve. La animación es solo CSS
// sobre un número fijo de copos (SNOWFLAKE_COUNT). Respeta "reducir
// movimiento" (ver index.css). La guirnalda del tema verde está en el Header.

// 👉 CANTIDAD DE NIEVE en computadora y en celular (pantallas < 640px).
// En celular se usan menos copos para cuidar el rendimiento y la batería.
const SNOWFLAKE_COUNT = 80;
const SNOWFLAKE_COUNT_MOBILE = 35;

const SIZES = ["text-[10px]", "text-xs", "text-sm", "text-base", "text-lg"];
const CHARS = ["❄", "❅", "•"];

// Valores calculados (no aleatorios) para que el render sea estable. El delay
// negativo hace que al abrir la página ya haya copos a media caída.
const SNOWFLAKES = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: SIZES[(i * 3) % SIZES.length],
  duration: `${10 + ((i * 7) % 8)}s`,
  delay: `-${(i * 5) % 17}s`,
  char: CHARS[i % CHARS.length],
}));

export default function FestiveBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Luces difusas */}
      <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-rose-400/10 blur-3xl" />

      {/* Nieve */}
      {SNOWFLAKES.map((flake, i) => (
        <span
          key={i}
          // display:none también detiene la animación: en celular no cuesta nada.
          className={`snowflake ${flake.size} ${i >= SNOWFLAKE_COUNT_MOBILE ? "max-sm:hidden" : ""}`}
          style={{ left: flake.left, animationDuration: flake.duration, animationDelay: flake.delay }}
        >
          {flake.char}
        </span>
      ))}
    </div>
  );
}
