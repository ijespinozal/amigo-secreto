/** Copia de `obj` sin la clave `key` (p. ej. para borrar el error de un campo). */
export const omit = (obj, key) => {
  const copy = { ...obj };
  delete copy[key];
  return copy;
};
