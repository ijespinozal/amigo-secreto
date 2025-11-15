// src/routes/adminRoutes.js
import express from "express";
import { createEvent, getEvents, addParticipant, getParticipants, runDraw } from "../controllers/adminController.js";
import { protect, onlyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/event", protect, onlyAdmin, createEvent);
router.get("/events", protect, onlyAdmin, getEvents);
router.post("/participant", protect, onlyAdmin, addParticipant);
router.get("/event/:eventId/participants", protect, onlyAdmin, getParticipants);
router.post("/draw", protect, onlyAdmin, runDraw);

export default router;
