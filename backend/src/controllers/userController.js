// src/controllers/userController.js
import { Participant, GiftOption, Assignment } from "../models/index.js";

/**
 * User joins an event (creates participant with userId)
 * POST /api/user/join
 * body: { eventId, phone?, firstName?, lastName?, email? }
 */
export const joinEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, phone, firstName, lastName, email } = req.body;
    if (!eventId) return res.status(400).json({ message: "eventId required" });

    // if participant already exists for this event and user -> return it
    let participant = await Participant.findOne({ where: { eventId, userId } });
    if (participant) return res.json({ participant });

    // else create participant and link to user
    participant = await Participant.create({
      eventId,
      userId,
      phone: phone || req.user.phone,
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: email || null
    });

    res.json({ message: "Joined event", participant });
  } catch (err) {
    console.error("joinEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add gift option for logged-in user's participant
 * POST /api/user/gift
 */
export const addGiftOption = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, note, donation, link } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const participant = await Participant.findOne({ where: { userId } });
    if (!participant) return res.status(400).json({ message: "User not a participant" });

    const gift = await GiftOption.create({
      participantId: participant.id,
      title,
      note: note || null,
      donation: donation || null,
      link: link || null
    });

    res.json({ message: "Gift added", gift });
  } catch (err) {
    console.error("addGiftOption:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get the logged-in user's secret friend (if draw done)
 * GET /api/user/secret-friend
 */
export const getMySecretFriend = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) find participant linked to this user
    const participant = await Participant.findOne({ where: { userId } });
    if (!participant) return res.status(400).json({ message: "User not a participant" });

    // 2) find assignment where this participant is the giver
    const assignment = await Assignment.findOne({
      where: { giverParticipantId: participant.id },
      include: [
        { model: Participant, as: "receiver" }
      ]
    });

    if (!assignment) return res.status(400).json({ message: "A la espera del sorteo" });

    // get gifts of receiver
    const gifts = await GiftOption.findAll({ where: { participantId: assignment.receiver.id } });

    res.json({
      revealed: true,
      friend: {
        id: assignment.receiver.id,
        firstName: assignment.receiver.firstName,
        lastName: assignment.receiver.lastName,
        phone: assignment.receiver.phone,
        email: assignment.receiver.email
      },
      gifts
    });
  } catch (err) {
    console.error("getMySecretFriend:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Obtener mis opciones de regalo
export const getMyGifts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar participante vinculado al usuario
    const participant = await Participant.findOne({
      where: { userId }
    });

    if (!participant) {
      return res.status(404).json({ message: "No eres participante de ningún evento" });
    }

    // Buscar regalos
    const gifts = await GiftOption.findAll({
      where: { participantId: participant.id }
    });

    return res.json(gifts);

  } catch (error) {
    console.error("Error getMyGifts", error);
    return res.status(500).json({ message: "Error obteniendo opciones de regalo" });
  }
};

/**
 * Delete one gift option of the logged user
 * DELETE /api/user/gift/:id
 */
export const deleteGiftOption = async (req, res) => {
  try {
    const userId = req.user.id;
    const giftId = req.params.id;

    // 1. Buscar el participante asociado al usuario
    const participant = await Participant.findOne({
      where: { userId }
    });

    if (!participant) {
      return res.status(404).json({ message: "No eres participante de ningún evento" });
    }

    // 2. Buscar el regalo, confirmando que pertenezca a este usuario
    const gift = await GiftOption.findOne({
      where: { id: giftId, participantId: participant.id }
    });

    if (!gift) {
      return res.status(404).json({ message: "Regalo no encontrado o no te pertenece" });
    }

    // 3. Eliminar
    await gift.destroy();

    return res.json({ message: "Regalo eliminado correctamente" });

  } catch (error) {
    console.error("deleteGiftOption error:", error);
    return res.status(500).json({ message: "Error eliminando regalo" });
  }
};
