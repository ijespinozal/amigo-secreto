// src/middlewares/validate.js
import { ERROR_CODES } from "../config/constants.js";

/**
 * Valida `req[source]` con un esquema zod. Si es válido, deja la versión
 * normalizada (trim, coerción de ids, campos desconocidos eliminados) en
 * `req.validated[source]` (y en req.body / req.params); si no, responde 400
 * con el primer error y la lista completa.
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

  // Fuente única y confiable de los datos validados (en Express 5 req.query es
  // un getter: no se puede reemplazar).
  req.validated = { ...req.validated, [source]: result.data };

  if (source === "body") {
    req.body = result.data;
  } else if (source === "params") {
    Object.assign(req.params, result.data);
  }
  next();
};
