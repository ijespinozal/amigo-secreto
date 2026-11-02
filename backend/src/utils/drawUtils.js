// src/utils/drawUtils.js
// Generación del sorteo. Usa crypto.randomInt (CSPRNG) en lugar de
// Math.random para que el resultado no sea predecible.
import { randomInt } from "node:crypto";

/** Fisher-Yates sobre una copia del arreglo. */
export const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Devuelve pares { giverId, receiverId } donde nadie se regala a sí mismo
 * (desarreglo). Por muestreo con rechazo: ~37% de las permutaciones son
 * válidas, así que en la práctica bastan 2-3 intentos.
 */
export const generateAssignments = (ids, maxAttempts = 1000) => {
  if (ids.length < 2) throw new Error("Se necesitan al menos 2 participantes");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const receivers = shuffle(ids);
    if (ids.every((id, index) => id !== receivers[index])) {
      return ids.map((giverId, index) => ({ giverId, receiverId: receivers[index] }));
    }
  }
  throw new Error("No se pudo generar un sorteo válido");
};
