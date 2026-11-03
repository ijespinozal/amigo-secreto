import { MIN_PARTICIPANTS_FOR_DRAW } from "../../config/rules";
import { formatCalendarDate } from "../../utils/date";
import { formatEventTime } from "../../utils/event";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Tarjeta de un evento en el panel de administración. */
export default function EventCard({ event, onEdit, onDelete, onDraw, onResetDraw }) {
  const participants = event.participantsCount ?? 0;
  const activities = event.activitiesCount ?? 0;
  const missing = Math.max(0, MIN_PARTICIPANTS_FOR_DRAW - participants);

  return (
    <article
      aria-label={event.title}
      className="flex flex-col bg-white rounded-[var(--radius-card)] border-2 border-gold-400/30 shadow-sm hover:shadow-[var(--shadow-card)] transition-shadow"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-festive font-bold text-xl text-brand-strong leading-snug break-words">{event.title}</h4>
            {event.description && (
              <p className="text-sm font-semibold text-ink-soft mt-0.5 line-clamp-2 break-words">{event.description}</p>
            )}
          </div>
          <div className="flex gap-1.5">
            <IconButton label="Editar evento" onClick={onEdit}>✏️</IconButton>
            <IconButton label="Eliminar evento" tone="danger" onClick={onDelete}>🗑️</IconButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-ink-soft">
          <span><span aria-hidden="true">📅</span> {event.date_event ? formatCalendarDate(event.date_event) : "Fecha por definir"}</span>
          {event.startTime && <span><span aria-hidden="true">🕖</span> {formatEventTime(event)}</span>}
          {event.location && <span className="break-words min-w-0"><span aria-hidden="true">📍</span> {event.location}</span>}
          <span><span aria-hidden="true">👥</span> {participants} {participants === 1 ? "participante" : "participantes"}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {event.drawDone ? (
            <Badge tone="green">✅ Sorteado el {formatDateTime(event.drawDate)}</Badge>
          ) : (
            <Badge tone="gold">⏳ Sorteo pendiente</Badge>
          )}
          {activities > 0 &&
            (event.schedulePublished ? (
              <Badge tone="blue">📅 Cronograma publicado ({activities})</Badge>
            ) : (
              <Badge tone="gray">📝 Cronograma en borrador ({activities})</Badge>
            ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gold-400/20 bg-cream-50 rounded-b-[var(--radius-card)] flex flex-wrap items-center gap-2">
        <Button to={`/admin/event/${event.id}/participants`} variant="secondary" size="sm">
          <span aria-hidden="true">👥</span> Participantes
        </Button>
        <Button to={`/admin/event/${event.id}/schedule`} variant="secondary" size="sm">
          <span aria-hidden="true">📅</span> Cronograma
        </Button>
        <div className="ml-auto">
          {event.drawDone ? (
            <Button variant="warning" size="sm" onClick={onResetDraw}>
              <span aria-hidden="true">🔄</span> Reabrir sorteo
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onDraw}
              disabled={missing > 0}
              title={missing > 0 ? `Se necesitan al menos ${MIN_PARTICIPANTS_FOR_DRAW} participantes` : undefined}
            >
              <span aria-hidden="true">🎁</span> Sortear
            </Button>
          )}
        </div>
        {!event.drawDone && missing > 0 && (
          <p className="basis-full text-xs font-semibold text-stone-500 text-right">
            Faltan {missing} participante{missing === 1 ? "" : "s"} para poder sortear (mínimo {MIN_PARTICIPANTS_FOR_DRAW}).
          </p>
        )}
      </div>
    </article>
  );
}
