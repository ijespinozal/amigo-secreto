// src/middlewares/participantContext.js
// Resuelve en qué evento está operando el usuario. Un usuario puede
// participar en varios eventos (p. ej. Navidad 2025 y 2026):
//   - con cabecera X-Event-Id -> ese evento (debe ser participante);
//   - sin cabecera            -> su evento más reciente.
// Deja el participante (con su Event) en req.participant.
import { EVENT_HEADER, ERROR_CODES } from "../config/constants.js";
import { Event, Participant } from "../models/index.js";

// Eventos más recientes primero; los que no tienen fecha (heredados) al final.
export const MOST_RECENT_EVENT_ORDER = [
  [Event, "date_event", "DESC"],
  [Event, "createdAt", "DESC"],
];

export const loadParticipant = async (req, res, next) => {
  try {
    const rawEventId = req.get(EVENT_HEADER);
    const where = { userId: req.user.id };

    if (rawEventId !== undefined && rawEventId !== "") {
      const eventId = Number(rawEventId);
      if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ code: ERROR_CODES.VALIDATION, message: `${EVENT_HEADER} inválido` });
      }
      where.eventId = eventId;
    }

    const participant = await Participant.findOne({
      where,
      include: [{ model: Event, required: true }],
      order: MOST_RECENT_EVENT_ORDER,
    });

    if (!participant) {
      return res.status(404).json({
        code: ERROR_CODES.NOT_PARTICIPANT,
        message: "No perteneces a ningún evento. Comunícate con el administrador.",
      });
    }

    req.participant = participant;
    next();
  } catch (err) {
    next(err);
  }
};
