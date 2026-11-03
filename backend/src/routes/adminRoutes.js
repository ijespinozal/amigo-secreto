// src/routes/adminRoutes.js
import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  addParticipant,
  addParticipantsBulk,
  getParticipantCandidates,
  getParticipants,
  deleteParticipant,
  runDraw,
  resetDraw,
  getAllUsers,
  resetPassword,
  deleteUser,
} from "../controllers/adminController.js";
import {
  getEventSchedule,
  createActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
  setScheduleVisibility,
} from "../controllers/scheduleController.js";
import { protect, onlyAdmin } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import {
  activitySchema,
  bulkParticipantsSchema,
  candidatesQuerySchema,
  drawSchema,
  eventIdParam,
  eventSchema,
  idParam,
  participantSchema,
  resetPasswordSchema,
  scheduleOrderSchema,
  scheduleVisibilitySchema,
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
router.get("/event/:id/candidates", validate(idParam, "params"), validate(candidatesQuerySchema, "query"), getParticipantCandidates);
router.post("/event/:id/participants/bulk", validate(idParam, "params"), validate(bulkParticipantsSchema), addParticipantsBulk);
router.delete("/participant/:id", validate(idParam, "params"), deleteParticipant);

router.post("/draw", validate(drawSchema), runDraw);

// Cronograma del evento
const eventParams = validate(idParam, "params");
router.get("/event/:id/schedule", eventParams, getEventSchedule);
router.post("/event/:id/schedule/activities", eventParams, validate(activitySchema), createActivity);
router.put("/event/:id/schedule/order", eventParams, validate(scheduleOrderSchema), reorderActivities);
router.put("/event/:id/schedule/visibility", eventParams, validate(scheduleVisibilitySchema), setScheduleVisibility);
router.put("/schedule/activities/:id", validate(idParam, "params"), validate(activitySchema), updateActivity);
router.delete("/schedule/activities/:id", validate(idParam, "params"), deleteActivity);

router.get("/users", getAllUsers);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.delete("/user/:id", validate(idParam, "params"), deleteUser);

export default router;
