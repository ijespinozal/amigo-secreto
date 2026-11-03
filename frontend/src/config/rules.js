// Reglas de negocio compartidas con el backend (backend/src/config/constants.js).
// El backend es quien las hace cumplir; aquí se usan para guiar al usuario.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // límite de bcrypt
export const MAX_GIFTS_PER_PARTICIPANT = 3;
export const MIN_PARTICIPANTS_FOR_DRAW = 3;
export const PHONE_PATTERN = /^\d{9}$/;
