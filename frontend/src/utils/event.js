// Reglas y presentación de un evento (fecha, hora de inicio, lugar y presupuesto).
import { parseCalendarDate } from "./date";
import { formatScheduleTime } from "./schedule";

export const EMPTY_EVENT = Object.freeze({
  title: "",
  description: "",
  date_event: "",
  startTime: "",
  location: "",
  budget: "",
  lockGiftsAfterDraw: true,
});

export const MAX_EVENT_BUDGET = 100000; // mismo límite que el backend

/** Valores del formulario a partir de un evento guardado (null -> ""). */
export const toEventForm = (event) => ({
  title: event?.title ?? "",
  description: event?.description ?? "",
  date_event: event?.date_event ?? "",
  startTime: event?.startTime ?? "",
  location: event?.location ?? "",
  budget: event?.budget === null || event?.budget === undefined ? "" : String(event.budget),
  lockGiftsAfterDraw: event?.lockGiftsAfterDraw !== false,
});

/**
 * ¿Las opciones de regalo ya no se pueden editar ni eliminar? Solo si el
 * evento fue sorteado y tiene el bloqueo activado (por defecto sí). Agregar
 * siempre se permite hasta el límite.
 */
export const giftsLocked = (event) => event?.drawDone === true && event?.lockGiftsAfterDraw !== false;

/** Errores por campo ({} si es válido). Hora, lugar y presupuesto son opcionales. */
export const validateEvent = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = "El título es obligatorio.";
  if (!form.date_event) errors.date_event = "La fecha es obligatoria.";
  const budget = String(form.budget ?? "").trim();
  if (budget) {
    const amount = Number(budget);
    if (!Number.isFinite(amount) || amount <= 0) errors.budget = "Ingresa un monto mayor que 0.";
    else if (amount > MAX_EVENT_BUDGET) errors.budget = `El monto máximo es S/ ${MAX_EVENT_BUDGET}.`;
    else if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-6) errors.budget = "Usa como máximo 2 decimales.";
  }
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

/** 50 -> "S/ 50"; 49.9 -> "S/ 49.90" ("" si no hay presupuesto). */
export const formatBudget = (budget) => {
  if (budget === null || budget === undefined || budget === "") return "";
  const amount = Number(budget);
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/** Búsqueda del lugar en Google Maps (el lugar es texto libre). */
export const mapsUrl = (location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
