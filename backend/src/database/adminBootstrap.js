// src/database/adminBootstrap.js
// Crea el administrador de forma idempotente. Sustituye al endpoint público
// /api/auth/create-admin: solo quien controla las variables de entorno del
// servidor puede crear un admin.
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

const MIN_PASSWORD_LENGTH = 8;

/**
 * @returns {Promise<"created"|"promoted"|"unchanged">}
 */
export const ensureAdmin = async ({ phone, password, firstName = "Admin", lastName = null }) => {
  if (!phone || !password) throw new Error("ADMIN_PHONE y ADMIN_PASSWORD son obligatorios");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  const existing = await User.findOne({ where: { phone } });
  if (existing) {
    // Nunca se sobrescribe la contraseña de una cuenta existente: el bootstrap
    // corre en cada arranque y no debe deshacer un cambio de contraseña.
    if (existing.role === "admin") return "unchanged";
    existing.role = "admin";
    await existing.save();
    return "promoted";
  }

  await User.create({
    phone,
    password: await bcrypt.hash(password, 10),
    firstName,
    lastName,
    role: "admin",
  });
  return "created";
};
