// src/routes/adminRoutes.js
import express from "express";
import { createEvent, getEvents, addParticipant, getParticipants, runDraw, getAllUsers, resetPassword, deleteParticipant, deleteUser } from "../controllers/adminController.js";
import { protect, onlyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/event", protect, onlyAdmin, createEvent);
router.get("/events", protect, onlyAdmin, getEvents);
router.post("/participant", protect, onlyAdmin, addParticipant);
router.get("/event/:eventId/participants", protect, onlyAdmin, getParticipants);
router.post("/draw", protect, onlyAdmin, runDraw);
router.get("/users", protect, onlyAdmin, getAllUsers);
router.post("/reset-password", protect, onlyAdmin, resetPassword);
router.delete("/participant/:id", protect, onlyAdmin, deleteParticipant);
router.delete("/user/:id", protect, onlyAdmin, deleteUser);

export default router;
