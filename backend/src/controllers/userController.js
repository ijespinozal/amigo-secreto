// src/controllers/userController.js
// Las rutas por evento reciben req.participant resuelto por loadParticipant
// (cabecera X-Event-Id o el evento más reciente del usuario).
// La entrada llega validada y normalizada por los esquemas de src/validation.
import bcrypt from "bcryptjs";
import { ERROR_CODES, MAX_GIFTS_PER_PARTICIPANT } from "../config/constants.js";
import { Participant, GiftOption, Assignment, User, Event, sequelize } from "../models/index.js";
import { MOST_RECENT_EVENT_ORDER } from "../middlewares/participantContext.js";

const serializeEvent = (event) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  date_event: event.date_event,
  drawDone: event.drawDone,
});

const GIFT_NOT_FOUND = { message: "Regalo no encontrado o no te pertenece" };

/** Regalo del usuario autenticado, sin importar en qué evento esté. */
const findOwnGift = (giftId, userId) =>
  GiftOption.findOne({
    where: { id: giftId },
    include: [{ model: Participant, attributes: ["userId"], where: { userId }, required: true }],
  });

/**
 * Eventos en los que participa el usuario, del más reciente al más antiguo.
 * GET /api/user/events
 */
export const getMyEvents = async (req, res) => {
  try {
    const participants = await Participant.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event, required: true }],
      order: MOST_RECENT_EVENT_ORDER,
    });

    res.json({
      events: participants.map((p) => ({ participantId: p.id, ...serializeEvent(p.Event) })),
    });
  } catch (err) {
    console.error("getMyEvents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Participante y evento actuales del usuario.
 * GET /api/user/event-info
 */
export const getMyEventInfo = (req, res) => {
  const { participant } = req;
  res.json({
    participantId: participant.id,
    eventId: participant.eventId,
    event: serializeEvent(participant.Event),
  });
};

/**
 * Amigo secreto del usuario en el evento actual.
 * GET /api/user/secret-friend
 *   200 { revealed: false }          -> aún no hay sorteo
 *   200 { revealed: true, friend }   -> amigo secreto y sus regalos
 *   404 NOT_PARTICIPANT              -> (loadParticipant) no pertenece a un evento
 */
export const getMySecretFriend = async (req, res) => {
  try {
    const { participant } = req;
    const event = serializeEvent(participant.Event);

    const assignment = participant.Event.drawDone
      ? await Assignment.findOne({
          where: { giverParticipantId: participant.id },
          include: [{ model: Participant, as: "receiver", include: [GiftOption] }],
        })
      : null;

    if (!assignment) return res.json({ revealed: false, event });

    const { receiver } = assignment;
    res.json({
      revealed: true,
      event,
      friend: {
        id: receiver.id,
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        phone: receiver.phone,
        email: receiver.email,
      },
      gifts: receiver.GiftOptions,
    });
  } catch (err) {
    console.error("getMySecretFriend:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Opciones de regalo del usuario en el evento actual.
 * GET /api/user/gifts
 */
export const getMyGifts = async (req, res) => {
  try {
    const gifts = await GiftOption.findAll({
      where: { participantId: req.participant.id },
      order: [["createdAt", "ASC"]],
    });
    return res.json(gifts);
  } catch (error) {
    console.error("Error getMyGifts", error);
    return res.status(500).json({ message: "Error obteniendo opciones de regalo" });
  }
};

/**
 * Agrega una opción de regalo respetando el máximo por participante.
 * POST /api/user/gift
 */
export const addGiftOption = async (req, res) => {
  try {
    const gift = await sequelize.transaction(async (transaction) => {
      // Bloquea la fila del participante: dos envíos simultáneos no pueden
      // leer el mismo conteo y superar el límite.
      await Participant.findByPk(req.participant.id, { transaction, lock: transaction.LOCK.UPDATE });

      const count = await GiftOption.count({ where: { participantId: req.participant.id }, transaction });
      if (count >= MAX_GIFTS_PER_PARTICIPANT) return null;

      return GiftOption.create({ ...req.body, participantId: req.participant.id }, { transaction });
    });

    if (!gift) {
      return res.status(409).json({
        code: ERROR_CODES.GIFT_LIMIT,
        message: `Solo puedes registrar hasta ${MAX_GIFTS_PER_PARTICIPANT} opciones de regalo`,
      });
    }

    res.status(201).json({ message: "Gift added", gift });
  } catch (err) {
    console.error("addGiftOption:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Actualiza una opción de regalo propia. Solo se modifican los campos enviados.
 * PUT /api/user/gift/:id
 */
export const updateGiftOption = async (req, res) => {
  try {
    const gift = await findOwnGift(req.params.id, req.user.id);
    if (!gift) return res.status(404).json(GIFT_NOT_FOUND);

    await gift.update(req.body);

    return res.json({ message: "Regalo actualizado correctamente", gift });
  } catch (error) {
    console.error("updateGiftOption error:", error);
    return res.status(500).json({ message: "Error actualizando regalo" });
  }
};

/**
 * Elimina una opción de regalo propia.
 * DELETE /api/user/gift/:id
 */
export const deleteGiftOption = async (req, res) => {
  try {
    const gift = await findOwnGift(req.params.id, req.user.id);
    if (!gift) return res.status(404).json(GIFT_NOT_FOUND);

    await gift.destroy();

    return res.json({ message: "Regalo eliminado correctamente" });
  } catch (error) {
    console.error("deleteGiftOption error:", error);
    return res.status(500).json({ message: "Error eliminando regalo" });
  }
};

/**
 * Donaciones registradas por los participantes del evento actual.
 * GET /api/user/donations
 */
export const getEventDonations = async (req, res) => {
  try {
    const participants = await Participant.findAll({
      where: { eventId: req.participant.eventId },
      include: [{ model: GiftOption, required: false }],
      order: [["firstName", "ASC"], ["lastName", "ASC"]],
    });

    const result = participants.flatMap((p) =>
      (p.GiftOptions || [])
        .filter((g) => g.donation && g.donation.trim() !== "")
        .map((g) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          donation: g.donation,
        }))
    );

    return res.json(result);
  } catch (error) {
    console.error("getEventDonations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña cambiada correctamente 🎄" });
  } catch (err) {
    console.error("changePassword:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
