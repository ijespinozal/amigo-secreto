// src/routes/authRoutes.js
import express from "express";
import { register, login } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiters.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);

// Los administradores se crean con `npm run db:admin` (variables ADMIN_*),
// nunca desde un endpoint público.

export default router;
