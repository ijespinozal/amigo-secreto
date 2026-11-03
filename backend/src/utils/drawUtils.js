// src/utils/drawUtils.js
// Generación del sorteo. Usa crypto.randomInt (CSPRNG) en lugar de
// Math.random para que el resultado no sea predecible.
//
// El sorteo es una CADENA: se ordena a los participantes al azar y cada uno
// le regala al siguiente (el último al primero). Así, con 3 o más:
//   - nadie se regala a sí mismo,
//   - cada uno da y recibe exactamente un regalo,
//   - nunca hay parejas mutuas (A→B y B→A),
//   - y además no quedan juntos quienes comparten el primer nombre
//     ("Luis Angel" no le regala a "Luis Miguel").
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

/** Primer nombre normalizado: "  Luis Ángel " -> "luis". Vacío si no hay nombre. */
export const firstNameKey = (firstName) =>
  (firstName ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0] ?? "";

const conflicts = (a, b) => a.nameKey !== "" && a.nameKey === b.nameKey;

/**
 * Grupos de primer nombre que impiden el sorteo. En una cadena circular de n
 * personas, k personas con el mismo nombre pueden quedar sin vecinos iguales
 * solo si k <= n/2 (condición necesaria y suficiente).
 * @returns {{ name: string, count: number, max: number }[]}
 */
export const findNameConflicts = (participants) => {
  const max = Math.floor(participants.length / 2);
  const groups = new Map();
  for (const p of participants) {
    const key = firstNameKey(p.firstName);
    if (!key) continue;
    const group = groups.get(key) ?? { name: p.firstName.trim().split(/\s+/)[0], count: 0, max };
    group.count++;
    groups.set(key, group);
  }
  return [...groups.values()].filter((g) => g.count > max);
};

const isValidCycle = (order) =>
  order.every((p, i) => !conflicts(p, order[(i + 1) % order.length]));

/** Búsqueda con retroceso (orden aleatorio) de una cadena válida. */
const backtrack = (people) => {
  const [first, ...rest] = shuffle(people);
  const order = [first];
  const used = new Set();

  const extend = () => {
    if (order.length === people.length) return !conflicts(order[order.length - 1], first);
    const last = order[order.length - 1];
    for (const next of shuffle(rest)) {
      if (used.has(next.id) || conflicts(last, next)) continue;
      used.add(next.id);
      order.push(next);
      if (extend()) return true;
      order.pop();
      used.delete(next.id);
    }
    return false;
  };

  return extend() ? order : null;
};

/**
 * Genera las asignaciones del sorteo.
 * @param {{ id: number, firstName?: string }[]} participants
 * @returns {{ giverId: number, receiverId: number }[]}
 * @throws si hay menos de 3 participantes o la regla de nombres es imposible
 *         (validar antes con findNameConflicts para dar un mensaje claro)
 */
export const generateAssignments = (participants, maxAttempts = 2000) => {
  if (participants.length < 3) throw new Error("Se necesitan al menos 3 participantes");
  if (findNameConflicts(participants).length > 0) throw new Error("Hay demasiados participantes con el mismo nombre");

  const people = participants.map((p) => ({ id: p.id, nameKey: firstNameKey(p.firstName) }));

  // Muestreo con rechazo: uniforme entre las cadenas válidas. Sin nombres
  // repetidos acepta al primer intento.
  let order = null;
  for (let attempt = 0; attempt < maxAttempts && !order; attempt++) {
    const candidate = shuffle(people);
    if (isValidCycle(candidate)) order = candidate;
  }
  // Casos muy ajustados (p. ej. la mitad con el mismo nombre): la condición
  // de findNameConflicts garantiza que existe, así que el retroceso la encuentra.
  order ??= backtrack(people);
  if (!order) throw new Error("No se pudo generar un sorteo válido");

  return order.map((p, i) => ({ giverId: p.id, receiverId: order[(i + 1) % order.length].id }));
};
