// src/controllers/authController.js
// La entrada llega validada y normalizada por los esquemas de src/validation.
import bcrypt from "bcryptjs";
import { UniqueConstraintError } from "sequelize";
import { ERROR_CODES } from "../config/constants.js";
import { User, Participant, sequelize } from "../models/index.js";
import { signToken } from "../utils/tokens.js";
import { toSafeUser } from "../utils/users.js";

// Hash de referencia para que un teléfono inexistente tarde lo mismo que una
// contraseña incorrecta: el tiempo de respuesta no revela qué números existen.
const DUMMY_HASH = bcrypt.hashSync("amigo-secreto-dummy-password", 10);

export const register = async (req, res) => {
  try {
    const { phone, password, firstName, lastName } = req.body;

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ code: ERROR_CODES.PHONE_TAKEN, message: "El número ya ha sido registrado." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await sequelize.transaction(async (transaction) => {
      const created = await User.create(
        { phone, password: hashed, firstName, lastName, role: "user" },
        { transaction }
      );

      // El admin pudo haber agregado este teléfono a varios eventos antes de
      // que la persona se registrara: se vincula con todos ellos.
      await Participant.update({ userId: created.id }, { where: { phone, userId: null }, transaction });

      return created;
    });

    res.status(201).json({ user: toSafeUser(user) });
  } catch (err) {
    // Dos registros simultáneos con el mismo teléfono: lo resuelve el índice único.
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ code: ERROR_CODES.PHONE_TAKEN, message: "El número ya ha sido registrado." });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ where: { phone } });
    const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !ok) return res.status(400).json({ message: "Usuario y/o contraseña incorrectos." });

    res.json({ token: signToken(user), user: toSafeUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
