// Utilidades del cronograma de actividades.

/** "18:00" -> "6:00 p. m." */
export const formatScheduleTime = (value) => {
  const match = /^(\d{2}):(\d{2})/.exec(value ?? "");
  if (!match) return value ?? "";
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return date.toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" });
};

const KNOWN_PLATFORMS = [
  { pattern: /(^|\.)tiktok\.com$/i, name: "TikTok" },
  { pattern: /(^|\.)(youtube\.com|youtu\.be)$/i, name: "YouTube" },
  { pattern: /(^|\.)instagram\.com$/i, name: "Instagram" },
  { pattern: /(^|\.)facebook\.com$/i, name: "Facebook" },
];

/** Texto del link de referencia según la plataforma ("Ver ejemplo en TikTok"). */
export const referenceLinkLabel = (url) => {
  try {
    const { hostname } = new URL(url);
    const platform = KNOWN_PLATFORMS.find((p) => p.pattern.test(hostname));
    return platform ? `Ver ejemplo en ${platform.name}` : "Ver ejemplo";
  } catch {
    return "Ver ejemplo";
  }
};

/** Clave de localStorage que recuerda qué versión del cronograma ya vio el usuario. */
export const SCHEDULE_SEEN_PREFIX = "scheduleSeen:";
export const scheduleSeenKey = (eventId) => `${SCHEDULE_SEEN_PREFIX}${eventId}`;
