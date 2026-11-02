// src/routes/userRoutes.js
import express from "express";
import {
  getMyEvents,
  getMyEventInfo,
  addGiftOption,
  getMySecretFriend,
  getMyGifts,
  updateGiftOption,
  deleteGiftOption,
  changePassword,
  getEventDonations,
  getGroupGifts,
} from "../controllers/userController.js";
import { getMySchedule } from "../controllers/scheduleController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { loadParticipant } from "../middlewares/participantContext.js";
import { validate } from "../middlewares/validate.js";
import { changePasswordLimiter } from "../middlewares/rateLimiters.js";
import { changePasswordSchema, createGiftSchema, idParam, updateGiftSchema } from "../validation/schemas.js";

const router = express.Router();

router.use(protect);

// Cuenta
router.get("/events", getMyEvents);
router.post("/change-password", changePasswordLimiter, validate(changePasswordSchema), changePassword);

// Por evento (cabecera X-Event-Id; sin ella, el evento más reciente)
router.get("/event-info", loadParticipant, getMyEventInfo);
router.get("/secret-friend", loadParticipant, getMySecretFriend);
router.get("/donations", loadParticipant, getEventDonations);
router.get("/schedule", loadParticipant, getMySchedule);
router.get("/group-gifts", loadParticipant, getGroupGifts);
router.get("/gifts", loadParticipant, getMyGifts);
router.post("/gift", loadParticipant, validate(createGiftSchema), addGiftOption);

// Un regalo se identifica por id y se verifica que sea del usuario: no depende del evento.
router.put("/gift/:id", validate(idParam, "params"), validate(updateGiftSchema), updateGiftOption);
router.delete("/gift/:id", validate(idParam, "params"), deleteGiftOption);

export default router;
