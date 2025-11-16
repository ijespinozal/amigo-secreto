// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Participant } from "../models/index.js";

const jwtSecret = process.env.JWT_SECRET || "secret";

export const register = async (req, res) => {
  try {
    const { phone, password, firstName, lastName } = req.body;
    if (!phone || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Fields missing" });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) return res.status(400).json({ message: "El número ya ha sido registrado." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ phone, password: hashed, firstName, lastName, role: "user" });

    // Link to participant if there is a participant with same phone and no userId
    const participant = await Participant.findOne({ where: { phone, userId: null } });
    if (participant) {
      participant.userId = user.id;
      await participant.save();
    }

    const userSafe = { id: user.id, phone: user.phone, firstName: user.firstName, lastName: user.lastName, role: user.role };
    res.json({ user: userSafe });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(400).json({ message: "Usuario y/o contraseña incorrectos." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Usuario y/o contraseña incorrectos." });

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "7d" });
    const userSafe = { id: user.id, phone: user.phone, firstName: user.firstName, lastName: user.lastName, role: user.role };

    res.json({ token, user: userSafe });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Optional: create admin endpoint (temporary) */
export const createAdmin = async (req, res) => {
  try {
    const { phone, password, firstName, lastName } = req.body;
    if (!phone || !password || !firstName) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ where: { phone } });
    if (existing) return res.status(400).json({ message: "Phone exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({ phone, password: hashed, firstName, lastName, role: "admin" });

    res.json({ message: "Admin created", adminId: admin.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
