import useCountdown from "../../hooks/useCountdown";
import { daysUntil, formatCalendarDate, parseCalendarDate } from "../../utils/date";
import { eventStart, formatEventTime, mapsUrl } from "../../utils/event";
import Badge from "../ui/Badge";

const UNITS = [
  ["days", "Días"],
  ["hours", "Horas"],
  ["minutes", "Minutos"],
  ["seconds", "Segundos"],
];

/** "24 de diciembre" (+ año si no es el actual). */
const formatEventDate = (value) => {
  const date = parseCalendarDate(value);
  const options = { day: "numeric", month: "long" };
  if (date && date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
  return formatCalendarDate(value, options);
};

function Hero({ badge, title, subtitle, details, children }) {
  return (
    <section className="relative overflow-hidden bg-cream-100 rounded-[var(--radius-panel)] p-6 sm:p-9 shadow-[var(--shadow-cozy)] border-2 border-gold-400/50">
      <div aria-hidden="true" className="absolute -right-4 -top-4 text-6xl opacity-30 select-none">❄️</div>
      <div aria-hidden="true" className="absolute -left-3 -bottom-3 text-6xl opacity-20 select-none">🔔</div>
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className="max-w-2xl">
          {badge && <Badge tone="gold" className="uppercase tracking-wider mb-2">{badge}</Badge>}
          <h2 className="font-festive font-bold text-2xl sm:text-3xl md:text-4xl text-brand-strong tracking-tight leading-snug">
            {title}
          </h2>
          {details}
          {subtitle && <p className="mt-2 font-semibold text-ink-soft">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Hora y lugar del evento (si están definidos), con enlace al mapa. */
function WhenWhere({ event }) {
  const time = formatEventTime(event);
  if (!time && !event.location) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      {time && <Badge tone="green" className="text-sm">🕖 {time}</Badge>}
      {event.location && (
        <a
          href={mapsUrl(event.location)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 max-w-full px-3 py-1 rounded-full bg-white border border-gold-400/60 font-festive font-bold text-sm text-brand-strong hover:bg-gold-400/20 break-words"
          title="Ver en Google Maps"
        >
          📍 {event.location} <span className="text-xs text-pine-700 underline underline-offset-2 whitespace-nowrap">Ver mapa</span>
        </a>
      )}
    </div>
  );
}

/** Cuenta regresiva del evento seleccionado, con sus estados: sin evento, sin fecha, próximo, hoy y pasado. */
export default function CountdownHero({ event }) {
  const countdown = useCountdown(eventStart(event));

  if (!event) {
    return (
      <Hero
        badge="🎄 Navidad"
        title="¡Prepárate para la Navidad!"
        subtitle="Cuando el administrador te agregue a un evento, aquí verás la cuenta regresiva."
      />
    );
  }

  if (!countdown) {
    return <Hero badge="🎄 Navidad" title={event.title} subtitle="La fecha del evento aún no está definida." />;
  }

  const date = formatEventDate(event.date_event);
  const days = daysUntil(event.date_event);
  const details = <WhenWhere event={event} />;

  if (days < 0) {
    return <Hero badge="🎁 Evento finalizado" title={`Nuestra reunión navideña fue el ${date}`} subtitle="¡Gracias por participar! 🎄✨" />;
  }
  // Es hoy y ya empezó (o no tiene hora): no tiene sentido una cuenta en cero.
  if (days === 0 && (countdown.reached || !event.startTime)) {
    return <Hero badge="🎉 ¡Es hoy!" title="¡Hoy es nuestra reunión navideña!" details={details} subtitle="Que disfrutes el intercambio 🎁✨" />;
  }

  return (
    <Hero
      badge={days === 0 ? "🎉 ¡Es hoy!" : "⭐ Cuenta regresiva"}
      title={days === 0 ? "¡Hoy es nuestra reunión navideña!" : `Nuestra reunión navideña es el ${date}`}
      details={details}
      subtitle={days === 0 ? "Falta muy poco para empezar 🎁" : "Ve agregando tus opciones de regalo 🏃"}
    >
      <div
        role="timer"
        aria-label={`Faltan ${countdown.days} días, ${countdown.hours} horas y ${countdown.minutes} minutos`}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5 w-full max-w-xl"
      >
        {UNITS.map(([key, label]) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center py-4 px-3 rounded-[var(--radius-card)] bg-white border-2 border-gold-400/40 shadow-sm"
          >
            <span aria-hidden="true" className="font-festive font-bold text-3xl sm:text-4xl text-brand leading-none tabular-nums">
              {String(countdown[key]).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="font-festive font-semibold text-xs text-amber-800 uppercase tracking-wider mt-1.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </Hero>
  );
}
