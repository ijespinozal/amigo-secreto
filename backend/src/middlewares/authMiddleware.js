// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { passwordStamp, verifyToken } from "../utils/tokens.js";

const UNAUTHORIZED = { message: "Not authorized" };

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });

    const decoded = verifyToken(header.split(" ")[1]);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // La sesión pertenece a una contraseña anterior (se cambió o se reseteó).
    if (decoded.pv !== passwordStamp(user.password)) return res.status(401).json(UNAUTHORIZED);

    req.user = user;
    next();
  } catch (err) {
    // Token vencido o manipulado es un caso esperado del cliente, no un fallo
    // del servidor: no se registra la traza completa.
    if (!(err instanceof jwt.JsonWebTokenError)) console.error("Auth error:", err);
    res.status(401).json(UNAUTHORIZED);
  }
};

export const onlyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
};
