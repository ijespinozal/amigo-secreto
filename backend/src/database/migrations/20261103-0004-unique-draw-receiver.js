// En un sorteo cada participante recibe exactamente un regalo. El algoritmo
// (utils/drawUtils.js) ya lo garantiza; este índice lo hace cumplir también
// en la base de datos, igual que assignments_event_giver_unique para quien da.
// Idempotente: si ya existe no hace nada; si hubiera duplicados, falla con
// un mensaje claro en vez de borrar datos.
import { ensureUniqueIndex } from "../schemaHelpers.js";

const INDEX = "assignments_event_receiver_unique";

export const up = async ({ context: qi }) => {
  await ensureUniqueIndex(qi, "assignments", ["eventId", "receiverParticipantId"], INDEX);
};

export const down = async ({ context: qi }) => {
  const indexes = await qi.showIndex("assignments");
  if (indexes.some((index) => index.name === INDEX)) {
    await qi.removeIndex("assignments", INDEX);
  }
};
