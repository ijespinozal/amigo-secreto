// src/config/constants.js
// Reglas de negocio compartidas. Si cambian, cambiar también en el frontend
// (frontend/src/config/rules.js).

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt ignora todo lo que excede 72 bytes: se rechaza en vez de truncar en silencio.
export const PASSWORD_MAX_LENGTH = 72;

export const MAX_GIFTS_PER_PARTICIPANT = 3;

// Con 2 personas cada una sabe quién le tocó: el sorteo deja de ser secreto.
export const MIN_PARTICIPANTS_FOR_DRAW = 3;

export const EVENT_HEADER = "X-Event-Id";

// Códigos de error estables para que el frontend reaccione sin depender del texto.
export const ERROR_CODES = Object.freeze({
  VALIDATION: "VALIDATION_ERROR",
  NOT_PARTICIPANT: "NOT_PARTICIPANT",
  DRAW_LOCKED: "DRAW_LOCKED",
  ALREADY_DRAWN: "ALREADY_DRAWN",
  NOT_ENOUGH_PARTICIPANTS: "NOT_ENOUGH_PARTICIPANTS",
  GIFT_LIMIT: "GIFT_LIMIT",
  DUPLICATE_PARTICIPANT: "DUPLICATE_PARTICIPANT",
  PHONE_TAKEN: "PHONE_TAKEN",
  RATE_LIMITED: "RATE_LIMITED",
});
