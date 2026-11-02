// src/validation/schemas.js
// Esquemas de entrada de la API. El backend es la última línea de defensa:
// el frontend valida por comodidad del usuario, aquí se valida por seguridad.
import { z } from "zod";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../config/constants.js";

const requiredText = (label, max) =>
  z
    .string({ required_error: `${label} es obligatorio`, invalid_type_error: `${label} debe ser texto` })
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} admite máximo ${max} caracteres`);

// Texto opcional: "" o null se normalizan a null (= campo vacío).
const optionalText = (label, max) =>
  z
    .string({ invalid_type_error: `${label} debe ser texto` })
    .trim()
    .max(max, `${label} admite máximo ${max} caracteres`)
    .nullish()
    .transform((value) => value || null);

const phone = z
  .string({ required_error: "El teléfono es obligatorio", invalid_type_error: "El teléfono debe ser texto" })
  .trim()
  .regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos");

const newPassword = z
  .string({ required_error: "La contraseña es obligatoria" })
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `La contraseña admite máximo ${PASSWORD_MAX_LENGTH} caracteres`);

const link = z
  .string({ invalid_type_error: "El link debe ser texto" })
  .trim()
  .max(500, "El link admite máximo 500 caracteres")
  .nullish()
  .transform((value) => value || null)
  .refine((value) => value === null || isHttpUrl(value), "El link debe ser una URL válida (http:// o https://)");

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const calendarDate = z
  .string({ required_error: "La fecha del evento es obligatoria" })
  .refine(isCalendarDate, "La fecha del evento no es válida (YYYY-MM-DD)");

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const id = (label = "El id") =>
  z.coerce
    .number({ invalid_type_error: `${label} debe ser numérico` })
    .int(`${label} debe ser un entero`)
    .positive(`${label} debe ser positivo`);

export const idParam = z.object({ id: id() });
export const eventIdParam = z.object({ eventId: id("El evento") });

// ---- Auth ----
export const registerSchema = z.object({
  phone,
  password: newPassword,
  firstName: requiredText("El nombre", 100),
  lastName: requiredText("El apellido", 100),
});

// En login no se aplican reglas de formato: cuentas antiguas pueden no
// cumplirlas y no deben quedar bloqueadas.
export const loginSchema = z.object({
  phone: requiredText("El teléfono", 20),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(1, "La contraseña es obligatoria"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: "La contraseña actual es obligatoria" }).min(1, "La contraseña actual es obligatoria"),
    newPassword,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["newPassword"],
  });

// ---- Admin ----
export const eventSchema = z.object({
  title: requiredText("El título", 255),
  description: optionalText("La descripción", 2000),
  date_event: calendarDate,
});

export const participantSchema = z.object({
  eventId: id("El evento"),
  phone,
  firstName: requiredText("El nombre", 100),
  lastName: optionalText("El apellido", 100),
  email: optionalText("El email", 255).refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    "El email no es válido"
  ),
});

export const drawSchema = z.object({ eventId: id("El evento") });

export const resetPasswordSchema = z.object({ userId: id("El usuario") });

// ---- Cronograma ----
export const MAX_PRIZES_PER_ACTIVITY = 20;

export const activitySchema = z.object({
  // "HH:MM" (input type="time"); se guarda como TIME.
  startTime: z
    .string({ required_error: "La hora es obligatoria" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener el formato HH:MM"),
  title: requiredText("El título de la actividad", 150),
  description: optionalText("La descripción", 1000),
  participantsLabel: optionalText("El texto de participantes", 50),
  icon: optionalText("El ícono", 16),
  referenceUrl: link,
  prizes: z
    .array(requiredText("Cada premio", 255), { invalid_type_error: "Los premios deben ser una lista" })
    .max(MAX_PRIZES_PER_ACTIVITY, `Máximo ${MAX_PRIZES_PER_ACTIVITY} premios por actividad`)
    .default([]),
});

export const scheduleVisibilitySchema = z.object({
  published: z.boolean({ required_error: "Indica si el cronograma se publica", invalid_type_error: "published debe ser true o false" }),
});

export const scheduleOrderSchema = z.object({
  activityIds: z
    .array(id("Cada actividad"), { required_error: "activityIds es obligatorio" })
    .min(1, "La lista de actividades está vacía")
    .refine((ids) => new Set(ids).size === ids.length, "La lista de actividades tiene ids repetidos"),
});

// ---- Usuario ----
const giftFields = {
  title: requiredText("El título del regalo", 255),
  note: optionalText("La observación", 1000),
  donation: optionalText("La donación", 255),
  link,
};

export const createGiftSchema = z.object(giftFields);

// En la edición todos los campos son opcionales; los ausentes no se modifican.
export const updateGiftSchema = z
  .object({
    title: giftFields.title.optional(),
    note: giftFields.note.optional(),
    donation: giftFields.donation.optional(),
    link: giftFields.link.optional(),
  });
