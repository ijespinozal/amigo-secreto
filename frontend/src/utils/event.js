// Reglas y presentación de un evento (fecha, hora de inicio y lugar).
import { parseCalendarDate } from "./date";
import { formatScheduleTime } from "./schedule";

export const EMPTY_EVENT = Object.freeze({ title: "", description: "", date_event: "", startTime: "", location: "" });

/** Valores del formulario a partir de un evento guardado (null -> ""). */
export const toEventForm = (event) => ({
  title: event?.title ?? "",
  description: event?.description ?? "",
  date_event: event?.date_event ?? "",
  startTime: event?.startTime ?? "",
  location: event?.location ?? "",
});

/** Errores por campo ({} si es válido). Hora y lugar son opcionales. */
export const validateEvent = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "El título es obligatorio.";
  if (!form.date_event) errors.date_event = "La fecha es obligatoria.";
  return errors;
};

/** Inicio del evento en hora local: fecha + hora (o medianoche si no hay hora). */
export const eventStart = (event) => {
  const date = parseCalendarDate(event?.date_event);
  if (!date) return null;
  const match = /^(\d{2}):(\d{2})/.exec(event.startTime ?? "");
  if (match) date.setHours(Number(match[1]), Number(match[2]));
  return date;
};

/** "19:30" -> "7:30 p. m." ("" si el evento no tiene hora). */
export const formatEventTime = (event) => (event?.startTime ? formatScheduleTime(event.startTime) : "");

/** Búsqueda del lugar en Google Maps (el lugar es texto libre). */
export const mapsUrl = (location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
