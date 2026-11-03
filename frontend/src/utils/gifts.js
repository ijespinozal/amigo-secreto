// Reglas de una opción de regalo (las mismas que valida el backend).

export const EMPTY_GIFT = Object.freeze({ title: "", note: "", donation: "", link: "" });

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/** Errores de validación por campo ({} si es válido). */
export const validateGift = (gift) => {
  const errors = {};
  if (!gift.title?.trim()) errors.title = "El título del regalo es obligatorio.";
  const link = gift.link?.trim();
  if (link && !isHttpUrl(link)) errors.link = "Ingresa un link válido que empiece con https://";
  return errors;
};

/** Valores del formulario a partir de un regalo guardado (null -> ""). */
export const toGiftForm = (gift) => ({
  title: gift?.title ?? "",
  note: gift?.note ?? "",
  donation: gift?.donation ?? "",
  link: gift?.link ?? "",
});
