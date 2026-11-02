// src/middlewares/validate.js
import { ERROR_CODES } from "../config/constants.js";

/**
 * Valida `req[source]` con un esquema zod. Si es válido, reemplaza los datos
 * por la versión normalizada (trim, coerción de ids, campos desconocidos
 * eliminados); si no, responde 400 con el primer error y la lista completa.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ code: ERROR_CODES.VALIDATION, message: errors[0].message, errors });
  }

  if (source === "body") {
    req.body = result.data;
  } else {
    // req.params / req.query son objetos gestionados por Express: se actualizan en sitio.
    Object.assign(req[source], result.data);
  }
  next();
};
