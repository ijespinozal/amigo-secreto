// Utilidades para fechas de calendario "YYYY-MM-DD" (sin hora).
// `new Date("2026-12-24")` se interpreta en UTC y en Perú (UTC-5) cae el 23;
// por eso estas funciones construyen la fecha en la zona horaria local.

/** "YYYY-MM-DD" -> Date a medianoche local, o null si el valor no es válido. */
export const parseCalendarDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : null;
};

/** Días de calendario desde hoy hasta `value` (negativo si ya pasó). */
export const daysUntil = (value, today = new Date()) => {
  const target = parseCalendarDate(value);
  if (!target) return null;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - startOfToday) / (1000 * 60 * 60 * 24));
};

/** "2026-12-24" -> "24 de diciembre de 2026" */
export const formatCalendarDate = (value, options = { day: "numeric", month: "long", year: "numeric" }) => {
  const date = parseCalendarDate(value);
  return date ? date.toLocaleDateString("es-PE", options) : "";
};

/** Fecha local de hoy en formato "YYYY-MM-DD" (para el atributo min de inputs). */
export const todayISO = (today = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};
