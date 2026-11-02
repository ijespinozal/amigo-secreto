// src/utils/passwords.js
import { randomInt } from "node:crypto";

// Sin caracteres ambiguos (0/O, 1/l/I) porque el admin la dicta o la copia
// a mano por WhatsApp.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Contraseña temporal aleatoria criptográficamente segura. */
export const generateTemporaryPassword = (length = 10) =>
  Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
