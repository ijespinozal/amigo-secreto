// src/controllers/chatController.js
// Chat secreto del evento. Cada participante tiene dos conversaciones:
//   "friend"  con su amigo secreto (a quien le regala): sabe quién es.
//   "santa"   con su Santa secreto (quien le regala): NO sabe quién es.
//
// Privacidad: las conversaciones se resuelven siempre a partir del
// participante autenticado (req.participant), nunca de ids enviados por el
// cliente, y las respuestas de "santa" no incluyen ningún dato de quien
// regala. Ver también la migración 0006.
import { Op } from "sequelize";
import { CHAT_HISTORY_LIMIT, ERROR_CODES } from "../config/constants.js";
import { Assignment, Participant, SecretMessage } from "../models/index.js";

const CHAT_UNAVAILABLE = {
  code: ERROR_CODES.CHAT_UNAVAILABLE,
  message: "Los mensajes secretos se habilitan cuando el administrador realiza el sorteo.",
};

/** Asignación de la conversación pedida, o null si no hay sorteo. */
const findAssignment = (participant, thread) =>
  Assignment.findOne({
    where: {
      eventId: participant.eventId,
      ...(thread === "friend" ? { giverParticipantId: participant.id } : { receiverParticipantId: participant.id }),
    },
  });

/** En "friend" escribo como quien regala; en "santa", como quien recibe. */
const iAmGiver = (thread) => thread === "friend";

const serializeMessage = (message, thread) => ({
  id: message.id,
  mine: message.fromGiver === iAmGiver(thread),
  body: message.body,
  createdAt: message.createdAt,
});

/** Mensajes recibidos y aún no leídos en una conversación. */
const countUnread = (assignmentId, thread) =>
  SecretMessage.count({ where: { assignmentId, fromGiver: !iAmGiver(thread), readAt: null } });

/**
 * Resumen de las dos conversaciones (para avisos de mensajes nuevos).
 * GET /api/user/chats
 */
export const getChats = async (req, res) => {
  try {
    const { participant } = req;
    if (!participant.Event.drawDone) return res.json({ available: false });

    const [toFriend, toSanta] = await Promise.all([findAssignment(participant, "friend"), findAssignment(participant, "santa")]);
    if (!toFriend || !toSanta) return res.json({ available: false });

    const friend = await Participant.findByPk(toFriend.receiverParticipantId, { attributes: ["firstName", "lastName"] });
    const [friendUnread, santaUnread] = await Promise.all([countUnread(toFriend.id, "friend"), countUnread(toSanta.id, "santa")]);

    return res.json({
      available: true,
      friend: { firstName: friend.firstName, lastName: friend.lastName, unread: friendUnread },
      santa: { unread: santaUnread },
    });
  } catch (err) {
    console.error("getChats:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mensajes de una conversación (los más recientes) y marca como leídos los recibidos.
 * GET /api/user/chats/:thread
 */
export const getMessages = async (req, res) => {
  try {
    const { thread } = req.params;
    const assignment = await findAssignment(req.participant, thread);
    if (!assignment) return res.status(409).json(CHAT_UNAVAILABLE);

    const latest = await SecretMessage.findAll({
      where: { assignmentId: assignment.id },
      order: [["id", "DESC"]],
      limit: CHAT_HISTORY_LIMIT,
    });

    await SecretMessage.update(
      { readAt: new Date() },
      { where: { assignmentId: assignment.id, fromGiver: !iAmGiver(thread), readAt: { [Op.is]: null } } }
    );

    return res.json({ messages: latest.reverse().map((m) => serializeMessage(m, thread)) });
  } catch (err) {
    console.error("getMessages:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Envía un mensaje en una conversación.
 * POST /api/user/chats/:thread
 */
export const sendMessage = async (req, res) => {
  try {
    const { thread } = req.params;
    const assignment = await findAssignment(req.participant, thread);
    if (!assignment) return res.status(409).json(CHAT_UNAVAILABLE);

    const message = await SecretMessage.create({
      assignmentId: assignment.id,
      fromGiver: iAmGiver(thread),
      body: req.body.body,
    });

    return res.status(201).json({ message: serializeMessage(message, thread) });
  } catch (err) {
    console.error("sendMessage:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
