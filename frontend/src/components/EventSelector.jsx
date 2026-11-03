import useAuth from "../hooks/useAuth";
import useEvents from "../hooks/useEvents";
import { formatCalendarDate } from "../utils/date";

/** Selector de evento. Solo aparece si el usuario participa en más de un evento. */
export default function EventSelector() {
  const { user } = useAuth();
  const { hasMultipleEvents, events, selectedEventId, selectEvent } = useEvents();

  if (user?.role !== "user" || !hasMultipleEvents) return null;

  return (
    <div className="mb-6 flex justify-center sm:justify-start">
      <label className="relative inline-flex max-w-full items-center gap-2 pl-4 pr-3 py-2 bg-cream-100/95 rounded-full border-2 border-gold-400/60 shadow-sm font-festive font-semibold text-brand-strong">
        <span aria-hidden="true">🎄</span>
        <span className="text-sm shrink-0">Evento:</span>
        <select
          id="event-selector"
          className="min-w-0 max-w-full truncate bg-transparent pr-1 text-sm sm:text-base font-semibold focus:outline-none cursor-pointer"
          value={selectedEventId ?? ""}
          onChange={(e) => selectEvent(Number(e.target.value))}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
              {ev.date_event ? ` — ${formatCalendarDate(ev.date_event)}` : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
