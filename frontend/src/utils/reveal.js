// Recuerda (en este navegador) que la persona ya abrió la sorpresa de su
// amigo secreto. Incluye al amigo asignado: si el admin repite el sorteo y
// toca otra persona, la sorpresa vuelve a aparecer. Se borra al cerrar sesión.
export const SECRET_REVEALED_PREFIX = "secretRevealed:";
export const secretRevealedKey = (eventId, friendId) => `${SECRET_REVEALED_PREFIX}${eventId}:${friendId}`;
