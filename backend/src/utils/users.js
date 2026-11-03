// src/utils/users.js

/** Datos del usuario que se pueden enviar al cliente (nunca la contraseña). */
export const toSafeUser = (user) => ({
  id: user.id,
  phone: user.phone,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
});
