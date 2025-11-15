// src/routes/authRoutes.js
import express from "express";
import { register, login, createAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// optional temporary endpoint to create admin. Remove in production.
router.post("/create-admin", createAdmin);

export default router;
