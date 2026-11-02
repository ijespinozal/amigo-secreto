import useAuth from "../hooks/useAuth";
import useEvents from "../hooks/useEvents";
import { formatCalendarDate } from "../utils/date";

/** Selector de evento. Solo aparece si el usuario participa en más de un evento. */
export default function EventSelector() {
  const { user } = useAuth();
  const { hasMultipleEvents, events, selectedEventId, selectEvent } = useEvents();

  if (user?.role !== "user" || !hasMultipleEvents) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-3 shadow-md border border-red-200">
      <label htmlFor="event-selector" className="font-semibold text-green-800">
        🎄 Evento:
      </label>
      <select
        id="event-selector"
        className="select select-bordered select-sm rounded-lg min-w-[220px]"
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
    </div>
  );
}
