// src/controllers/adminController.js
// La entrada llega validada y normalizada por los esquemas de src/validation.
import bcrypt from "bcryptjs";
import { Op, UniqueConstraintError } from "sequelize";
import { ERROR_CODES, MIN_PARTICIPANTS_FOR_DRAW } from "../config/constants.js";
import { Event, Participant, User, Assignment, GiftOption, ScheduleActivity, sequelize } from "../models/index.js";
import { findNameConflicts, generateAssignments } from "../utils/drawUtils.js";
import { generateTemporaryPassword } from "../utils/passwords.js";

const EVENT_NOT_FOUND = { message: "Evento no encontrado" };

const drawLockedResponse = (res) =>
  res.status(409).json({
    code: ERROR_CODES.DRAW_LOCKED,
    message: "El sorteo de este evento ya se realizó. Reabre el sorteo para modificar participantes.",
  });

const serializeEvent = (event) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  date_event: event.date_event,
  startTime: event.startTime?.slice(0, 5) ?? null, // "HH:MM:SS" -> "HH:MM"
  location: event.location ?? null,
  drawDone: event.drawDone,
  drawDate: event.drawDate,
  createdAt: event.createdAt,
  schedulePublished: event.schedulePublished,
  // Solo se informan si se cargaron las asociaciones; undefined se omite del JSON.
  participantsCount: event.Participants?.length,
  activitiesCount: event.activities?.length,
});

// ===============================
//  EVENTOS
// ===============================
export const createEvent = async (req, res) => {
  try {
    const { title, description, date_event, startTime, location } = req.body;
    const ev = await Event.create({ title, description, date_event, startTime, location, createdBy: req.user.id });
    res.status(201).json({ message: "Event created", event: { ...serializeEvent(ev), participantsCount: 0, activitiesCount: 0 } });
  } catch (err) {
    console.error("createEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      // separate: una consulta por relación, en vez de un JOIN participantes × actividades.
      include: [
        { model: Participant, attributes: ["id", "eventId"], separate: true },
        { model: ScheduleActivity, as: "activities", attributes: ["id", "eventId"], separate: true },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ events: events.map(serializeEvent) });
  } catch (err) {
    console.error("getEvents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.id, { include: [{ model: Participant, attributes: ["id"] }] });
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);

    const { title, description, date_event, startTime, location } = req.body;
    await ev.update({ title, description, date_event, startTime, location });

    res.json({ message: "Evento actualizado", event: serializeEvent(ev) });
  } catch (err) {
    console.error("updateEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Elimina el evento; participantes, regalos y asignaciones caen en cascada (FK). */
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json(EVENT_NOT_FOUND);
    res.json({ message: "Evento eliminado" });
  } catch (err) {
    console.error("deleteEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
//  PARTICIPANTES
// ===============================

/** Escapa los comodines de LIKE para que la búsqueda sea literal. */
const escapeLike = (text) => text.replace(/[\\%_]/g, "\\$&");

const CANDIDATES_LIMIT = 50;

/**
 * Usuarios registrados que aún no participan en el evento (para agregarlos
 * sin tipear sus datos). Búsqueda por nombre, apellido, nombre completo o
 * teléfono; la colación utf8mb4_unicode_ci ignora mayúsculas y tildes.
 * GET /api/admin/event/:id/candidates?q=
 */
export const getParticipantCandidates = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);

    const existing = await Participant.findAll({ where: { eventId: ev.id }, attributes: ["userId", "phone"], raw: true });
    const takenUserIds = existing.map((p) => p.userId).filter(Boolean);
    const takenPhones = existing.map((p) => p.phone);

    const conditions = [];
    if (takenUserIds.length) conditions.push({ id: { [Op.notIn]: takenUserIds } });
    if (takenPhones.length) conditions.push({ phone: { [Op.notIn]: takenPhones } });

    const { q } = req.validated.query;
    if (q) {
      const like = `%${escapeLike(q)}%`;
      const digits = q.replace(/\s/g, "");
      conditions.push({
        [Op.or]: [
          { firstName: { [Op.like]: like } },
          { lastName: { [Op.like]: like } },
          sequelize.where(sequelize.fn("CONCAT", sequelize.col("firstName"), " ", sequelize.col("lastName")), { [Op.like]: like }),
          ...(digits ? [{ phone: { [Op.like]: `%${escapeLike(digits)}%` } }] : []),
        ],
      });
    }

    const { rows, count } = await User.findAndCountAll({
      where: { [Op.and]: conditions },
      attributes: ["id", "firstName", "lastName", "phone", "role"],
      order: [["firstName", "ASC"], ["lastName", "ASC"]],
      limit: CANDIDATES_LIMIT,
    });

    res.json({ users: rows, total: count, limit: CANDIDATES_LIMIT });
  } catch (err) {
    console.error("getParticipantCandidates:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Agrega varios usuarios registrados al evento; nombre y teléfono salen de su
 * cuenta (sin errores de tipeo). Si ya existía un participante "sin cuenta"
 * con ese teléfono, se vincula en lugar de duplicarlo.
 * POST /api/admin/event/:id/participants/bulk — body: { userIds: [] }
 */
export const addParticipantsBulk = async (req, res) => {
  try {
    const { userIds } = req.body;

    const result = await sequelize.transaction(async (transaction) => {
      // Bloquea el evento: el sorteo no puede ocurrir a mitad del alta.
      const ev = await Event.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ev) return { status: 404, body: EVENT_NOT_FOUND };
      if (ev.drawDone) {
        return {
          status: 409,
          body: {
            code: ERROR_CODES.DRAW_LOCKED,
            message: "El sorteo de este evento ya se realizó. Reabre el sorteo para modificar participantes.",
          },
        };
      }

      const users = await User.findAll({ where: { id: userIds }, transaction });
      if (users.length !== userIds.length) {
        return { status: 404, body: { message: "Algunos usuarios ya no existen. Recarga la lista e inténtalo de nuevo." } };
      }

      const existing = await Participant.findAll({
        where: { eventId: ev.id, [Op.or]: [{ userId: userIds }, { phone: users.map((u) => u.phone) }] },
        transaction,
      });
      const byUserId = new Set(existing.map((p) => p.userId).filter(Boolean));
      const byPhone = new Map(existing.map((p) => [p.phone, p]));

      let added = 0, linked = 0, skipped = 0;
      for (const user of users) {
        const samePhone = byPhone.get(user.phone);
        if (byUserId.has(user.id) || (samePhone && samePhone.userId !== null)) {
          skipped++;
        } else if (samePhone) {
          await samePhone.update(
            { userId: user.id, firstName: user.firstName, lastName: user.lastName },
            { transaction }
          );
          linked++;
        } else {
          await Participant.create(
            { eventId: ev.id, userId: user.id, phone: user.phone, firstName: user.firstName, lastName: user.lastName },
            { transaction }
          );
          added++;
        }
      }
      return { status: 201, body: { message: "Participantes agregados", added, linked, skipped } };
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("addParticipantsBulk:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Agrega un participante a mano (personas que aún no tienen cuenta). Si el
 * teléfono ya pertenece a un usuario, se vincula y se usan los nombres de su
 * cuenta (fuente de verdad), no los tipeados.
 */
export const addParticipant = async (req, res) => {
  try {
    const { eventId, phone, firstName, lastName, email } = req.body;

    const ev = await Event.findByPk(eventId);
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);
    if (ev.drawDone) return drawLockedResponse(res);

    const user = await User.findOne({ where: { phone } });

    const participant = await Participant.create({
      eventId,
      userId: user ? user.id : null,
      phone,
      firstName: user ? user.firstName : firstName,
      lastName: user ? user.lastName : lastName,
      email,
    });

    res.status(201).json({ message: "Participant added", participant });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({
        code: ERROR_CODES.DUPLICATE_PARTICIPANT,
        message: "Ese teléfono ya está registrado en este evento",
      });
    }
    console.error("addParticipant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Participantes de un evento con su estado de registro y cantidad de regalos. */
export const getParticipants = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.eventId);
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);

    const participants = await Participant.findAll({
      where: { eventId: ev.id },
      include: [{ model: GiftOption, attributes: ["id"] }],
      order: [["firstName", "ASC"], ["lastName", "ASC"]],
    });

    res.json({
      event: serializeEvent(ev),
      participants: participants.map((p) => ({
        id: p.id,
        phone: p.phone,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        registered: p.userId !== null,
        giftsCount: p.GiftOptions.length,
      })),
    });
  } catch (err) {
    console.error("getParticipants:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByPk(req.params.id, { include: [Event] });
    if (!participant) return res.status(404).json({ message: "Participant not found" });
    if (participant.Event.drawDone) return drawLockedResponse(res);

    await participant.destroy();

    res.json({ message: "Participant deleted" });
  } catch (err) {
    console.error("deleteParticipant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
//  SORTEO
// ===============================

/**
 * Realiza el sorteo. La fila del evento se bloquea (SELECT ... FOR UPDATE)
 * para que dos clics simultáneos no generen dos sorteos distintos.
 */
export const runDraw = async (req, res) => {
  try {
    const { eventId } = req.body;

    const result = await sequelize.transaction(async (transaction) => {
      const ev = await Event.findByPk(eventId, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ev) return { status: 404, body: EVENT_NOT_FOUND };
      if (ev.drawDone) {
        return {
          status: 409,
          body: {
            code: ERROR_CODES.ALREADY_DRAWN,
            message: "Este evento ya fue sorteado. Reabre el sorteo si necesitas repetirlo.",
          },
        };
      }

      const participants = await Participant.findAll({ where: { eventId }, attributes: ["id", "firstName"], transaction });
      if (participants.length < MIN_PARTICIPANTS_FOR_DRAW) {
        return {
          status: 400,
          body: {
            code: ERROR_CODES.NOT_ENOUGH_PARTICIPANTS,
            message: `Se necesitan al menos ${MIN_PARTICIPANTS_FOR_DRAW} participantes para sortear`,
          },
        };
      }

      // Quienes comparten el primer nombre no pueden regalarse entre sí: con
      // demasiados del mismo nombre el sorteo es imposible y se explica por qué.
      const [conflict] = findNameConflicts(participants);
      if (conflict) {
        return {
          status: 400,
          body: {
            code: ERROR_CODES.DRAW_NAME_CONFLICT,
            message:
              `Hay ${conflict.count} participantes llamados "${conflict.name}" de ${participants.length} en total. ` +
              `Como quienes tienen el mismo nombre no pueden regalarse entre sí, pueden ser como máximo ${conflict.max}. ` +
              "Agrega más participantes para poder sortear.",
          },
        };
      }

      const pairs = generateAssignments(participants);

      await Assignment.destroy({ where: { eventId }, transaction });
      await Assignment.bulkCreate(
        pairs.map(({ giverId, receiverId }) => ({
          eventId,
          giverParticipantId: giverId,
          receiverParticipantId: receiverId,
        })),
        { transaction }
      );

      await ev.update({ drawDone: true, drawDate: new Date() }, { transaction });

      return { status: 200, body: { message: "Draw completed", assignmentsCount: pairs.length, event: serializeEvent(ev) } };
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("runDraw:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Anula el sorteo: borra las asignaciones y desbloquea el evento. */
export const resetDraw = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (transaction) => {
      const ev = await Event.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ev) return null;

      await Assignment.destroy({ where: { eventId: ev.id }, transaction });
      await ev.update({ drawDone: false, drawDate: null }, { transaction });
      return ev;
    });

    if (!result) return res.status(404).json(EVENT_NOT_FOUND);
    res.json({ message: "Sorteo reabierto", event: serializeEvent(result) });
  } catch (err) {
    console.error("resetDraw:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
//  USUARIOS
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "phone", "firstName", "lastName", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json({ users });
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Genera una contraseña temporal aleatoria. Se devuelve una única vez para
 * que el admin se la entregue al usuario; en la BD solo queda el hash.
 */
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const temporaryPassword = generateTemporaryPassword();
    user.password = await bcrypt.hash(temporaryPassword, 10);
    await user.save();

    res.json({ message: "Contraseña reseteada", temporaryPassword });
  } catch (err) {
    console.error("resetPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Sus participaciones se conservan sin vínculo (FK ON DELETE SET NULL).
    await user.destroy();

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("deleteUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};
