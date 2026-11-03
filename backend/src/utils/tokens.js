// src/utils/tokens.js
// Emisión y verificación de los JWT de sesión.
import { createHmac } from "node:crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Algoritmo fijo: jwt.verify no acepta otro (p. ej. "none").
const ALGORITHM = "HS256";

/**
 * Huella de la contraseña vigente (HMAC del hash bcrypt con el secreto JWT).
 * Viaja en el token: al cambiar o resetear la contraseña la huella cambia y
 * todas las sesiones anteriores dejan de ser válidas, sin guardar nada extra
 * en la BD. No revela el hash: sin el secreto no se puede calcular.
 */
export const passwordStamp = (passwordHash) =>
  createHmac("sha256", env.jwt.secret).update(passwordHash).digest("base64url").slice(0, 22);

/** Token de sesión del usuario (requiere user.password = hash bcrypt). */
export const signToken = (user) =>
  jwt.sign({ id: user.id, pv: passwordStamp(user.password) }, env.jwt.secret, {
    algorithm: ALGORITHM,
    expiresIn: env.jwt.expiresIn,
  });

/** Payload del token si es válido; lanza JsonWebTokenError si no. */
export const verifyToken = (token) => jwt.verify(token, env.jwt.secret, { algorithms: [ALGORITHM] });
