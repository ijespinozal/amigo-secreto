// src/middlewares/rateLimiters.js
// Protección contra fuerza bruta. El contador vive en memoria del proceso:
// suficiente para una sola instancia (Render free). Con varias instancias
// habría que usar un store compartido (p. ej. Redis).
import rateLimit from "express-rate-limit";
import { ERROR_CODES } from "../config/constants.js";

const limiter = ({ windowMinutes, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { code: ERROR_CODES.RATE_LIMITED, message },
  });

// Solo cuentan los intentos fallidos: un usuario legítimo nunca se bloquea
// por entrar varias veces.
export const loginLimiter = limiter({
  windowMinutes: 15,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Demasiados intentos fallidos de inicio de sesión. Intenta nuevamente en 15 minutos.",
});

export const registerLimiter = limiter({
  windowMinutes: 60,
  limit: 10,
  message: "Demasiados registros desde esta conexión. Intenta nuevamente en una hora.",
});

export const changePasswordLimiter = limiter({
  windowMinutes: 15,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Demasiados intentos de cambio de contraseña. Intenta nuevamente en 15 minutos.",
});
