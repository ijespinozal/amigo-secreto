// src/routes/adminRoutes.js
import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  addParticipant,
  getParticipants,
  deleteParticipant,
  runDraw,
  resetDraw,
  getAllUsers,
  resetPassword,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, onlyAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  drawSchema,
  eventIdParam,
  eventSchema,
  idParam,
  participantSchema,
  resetPasswordSchema,
} from "../validation/schemas.js";

const router = express.Router();

// Todas las rutas de este router requieren un admin autenticado.
router.use(protect, onlyAdmin);

router.post("/event", validate(eventSchema), createEvent);
router.get("/events", getEvents);
router.put("/event/:id", validate(idParam, "params"), validate(eventSchema), updateEvent);
router.delete("/event/:id", validate(idParam, "params"), deleteEvent);
router.post("/event/:id/reset-draw", validate(idParam, "params"), resetDraw);
router.get("/event/:eventId/participants", validate(eventIdParam, "params"), getParticipants);

router.post("/participant", validate(participantSchema), addParticipant);
router.delete("/participant/:id", validate(idParam, "params"), deleteParticipant);

router.post("/draw", validate(drawSchema), runDraw);

router.get("/users", getAllUsers);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.delete("/user/:id", validate(idParam, "params"), deleteUser);

export default router;
