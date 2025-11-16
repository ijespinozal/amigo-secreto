// src/controllers/adminController.js
import bcrypt from "bcryptjs";
import { Event, Participant, User, Assignment, sequelize } from "../models/index.js";

/**
 * Create event
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date_event } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const ev = await Event.create({
      title,
      description: description || null,
      date_event: date_event || null,
      createdBy: req.user ? req.user.id : null
    });

    res.json({ message: "Event created", event: ev });
  } catch (err) {
    console.error("createEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * List events
 */
export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ events });
  } catch (err) {
    console.error("getEvents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add participant (admin)
 * If there is a User with same phone and participant.userId is null, link it.
 */
export const addParticipant = async (req, res) => {
  try {
    const { eventId, phone, firstName, lastName, email } = req.body;
    if (!eventId || !phone || !firstName) return res.status(400).json({ message: "Missing fields" });

    // Check event exists
    const ev = await Event.findByPk(eventId);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    // look for user with same phone
    const user = await User.findOne({ where: { phone } });

    const participant = await Participant.create({
      eventId,
      userId: user ? user.id : null,
      phone,
      firstName,
      lastName: lastName || null,
      email: email || null
    });

    res.json({ message: "Participant added", participant });
  } catch (err) {
    console.error("addParticipant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get participants of an event
 */
export const getParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const list = await Participant.findAll({ where: { eventId } });
    res.json(list);
  } catch (err) {
    console.error("getParticipants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Run draw: create assignments without self-assignment
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const runDraw = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { eventId } = req.body;
    if (!eventId) {
      await t.rollback();
      return res.status(400).json({ message: "eventId required" });
    }

    const ev = await Event.findByPk(eventId);
    if (!ev) {
      await t.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    const participants = await Participant.findAll({ where: { eventId } });
    if (participants.length < 2) {
      await t.rollback();
      return res.status(400).json({ message: "Need at least 2 participants" });
    }

    const ids = participants.map(p => p.id);
    let receivers = [...ids];
    let attempts = 0;
    do {
      shuffle(receivers);
      attempts++;
      const hasSelf = ids.some((id, idx) => id === receivers[idx]);
      if (!hasSelf) break;
      if (attempts > 2000) {
        await t.rollback();
        return res.status(500).json({ message: "Could not generate assignments" });
      }
    } while (true);

    // delete previous assignments for event
    await Assignment.destroy({ where: { eventId }, transaction: t });

    const creations = ids.map((giverId, idx) => ({
      eventId,
      giverParticipantId: giverId,
      receiverParticipantId: receivers[idx]
    }));

    await Assignment.bulkCreate(creations, { transaction: t });

    ev.drawDone = true;
    ev.drawDate = new Date();
    await ev.save({ transaction: t });

    await t.commit();
    res.json({ message: "Draw completed", assignmentsCount: creations.length });
  } catch (err) {
    console.error("runDraw:", err);
    await t.rollback();
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
//  LISTAR TODOS LOS USUARIOS
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "phone", "firstName", "lastName", "role", "createdAt"]
    });

    res.json({ users });
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
//  RESET PASSWORD DE UN USUARIO
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Nueva contraseña por defecto
    const newPass = "123456";
    const hashed = await bcrypt.hash(newPass, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: `Contraseña reseteada a ${newPass}` });
  } catch (err) {
    console.error("resetPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await Participant.findByPk(id);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    await participant.destroy();

    res.json({ message: "Participant deleted" });
  } catch (err) {
    console.error("deleteParticipant:", err);
    res.status(500).json({ message: "Server error" });
  }
};
