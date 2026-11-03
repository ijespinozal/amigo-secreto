/** true si `value` es una URL absoluta http(s) (la misma regla que valida el backend). */
export const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
