// src/controllers/scheduleController.js
// Cronograma de actividades de un evento. La entrada llega validada y
// normalizada por los esquemas de src/validation.
import { createHash } from "node:crypto";
import { Event, ScheduleActivity, ScheduleActivityPrize, sequelize } from "../models/index.js";

const EVENT_NOT_FOUND = { message: "Evento no encontrado" };
const ACTIVITY_NOT_FOUND = { message: "Actividad no encontrada" };

const PRIZES_INCLUDE = { model: ScheduleActivityPrize, as: "prizes" };

const serializeActivity = (activity) => ({
  id: activity.id,
  position: activity.position,
  startTime: activity.startTime.slice(0, 5), // "HH:MM:SS" -> "HH:MM"
  title: activity.title,
  description: activity.description,
  participantsLabel: activity.participantsLabel,
  icon: activity.icon,
  referenceUrl: activity.referenceUrl,
  prizes: [...(activity.prizes ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((prize) => prize.description),
});

const loadActivities = async (eventId, transaction) => {
  const activities = await ScheduleActivity.findAll({
    where: { eventId },
    include: [PRIZES_INCLUDE],
    order: [["position", "ASC"], ["id", "ASC"]],
    transaction,
  });
  return activities.map(serializeActivity);
};

/**
 * Huella del contenido del cronograma: el frontend la usa para volver a
 * mostrarlo automáticamente cuando el admin lo modifica.
 */
const scheduleVersion = (activities) =>
  createHash("sha1").update(JSON.stringify(activities)).digest("hex").slice(0, 12);

const replacePrizes = async (activityId, prizes, transaction) => {
  await ScheduleActivityPrize.destroy({ where: { activityId }, transaction });
  if (prizes.length === 0) return;
  await ScheduleActivityPrize.bulkCreate(
    prizes.map((description, position) => ({ activityId, position, description })),
    { transaction }
  );
};

const activityFields = ({ startTime, title, description, participantsLabel, icon, referenceUrl }) => ({
  startTime,
  title,
  description,
  participantsLabel,
  icon,
  referenceUrl,
});

const findActivityWithPrizes = (id, transaction) =>
  ScheduleActivity.findByPk(id, { include: [PRIZES_INCLUDE], transaction });

// ===============================
//  ADMIN
// ===============================

/** GET /api/admin/event/:id/schedule */
export const getEventSchedule = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);

    const activities = await loadActivities(ev.id);
    res.json({
      event: { id: ev.id, title: ev.title, date_event: ev.date_event, schedulePublished: ev.schedulePublished },
      activities,
      version: scheduleVersion(activities),
    });
  } catch (err) {
    console.error("getEventSchedule:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** POST /api/admin/event/:id/schedule/activities — agrega la actividad al final. */
export const createActivity = async (req, res) => {
  try {
    const activity = await sequelize.transaction(async (transaction) => {
      // Bloquea el evento: dos altas simultáneas no pueden calcular la misma posición.
      const ev = await Event.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ev) return null;

      const lastPosition = (await ScheduleActivity.max("position", { where: { eventId: ev.id }, transaction })) ?? -1;
      const created = await ScheduleActivity.create(
        { ...activityFields(req.body), eventId: ev.id, position: lastPosition + 1 },
        { transaction }
      );
      await replacePrizes(created.id, req.body.prizes, transaction);
      return findActivityWithPrizes(created.id, transaction);
    });

    if (!activity) return res.status(404).json(EVENT_NOT_FOUND);
    res.status(201).json({ message: "Actividad agregada", activity: serializeActivity(activity) });
  } catch (err) {
    console.error("createActivity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** PUT /api/admin/schedule/activities/:id — reemplaza datos y premios. */
export const updateActivity = async (req, res) => {
  try {
    const activity = await sequelize.transaction(async (transaction) => {
      const current = await ScheduleActivity.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!current) return null;

      await current.update(activityFields(req.body), { transaction });
      await replacePrizes(current.id, req.body.prizes, transaction);
      return findActivityWithPrizes(current.id, transaction);
    });

    if (!activity) return res.status(404).json(ACTIVITY_NOT_FOUND);
    res.json({ message: "Actividad actualizada", activity: serializeActivity(activity) });
  } catch (err) {
    console.error("updateActivity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/admin/schedule/activities/:id
 * Si era la última actividad, el cronograma se despublica: un cronograma
 * publicado y vacío no tiene sentido.
 */
export const deleteActivity = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (transaction) => {
      const activity = await ScheduleActivity.findByPk(req.params.id, { transaction });
      if (!activity) return null;

      const { eventId } = activity;
      await activity.destroy({ transaction }); // los premios caen en cascada (FK)

      const remaining = await ScheduleActivity.count({ where: { eventId }, transaction });
      let unpublished = false;
      if (remaining === 0) {
        const [updated] = await Event.update(
          { schedulePublished: false },
          { where: { id: eventId, schedulePublished: true }, transaction }
        );
        unpublished = updated > 0;
      }
      return { unpublished };
    });

    if (!result) return res.status(404).json(ACTIVITY_NOT_FOUND);
    res.json({ message: "Actividad eliminada", ...result });
  } catch (err) {
    console.error("deleteActivity:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/event/:id/schedule/order
 * body: { activityIds: [...] } — debe contener exactamente las actividades del evento.
 */
export const reorderActivities = async (req, res) => {
  try {
    const { activityIds } = req.body;

    const result = await sequelize.transaction(async (transaction) => {
      const ev = await Event.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!ev) return { status: 404, body: EVENT_NOT_FOUND };

      const current = await ScheduleActivity.findAll({ where: { eventId: ev.id }, attributes: ["id"], transaction });
      const currentIds = new Set(current.map((a) => a.id));
      const sameSet = currentIds.size === activityIds.length && activityIds.every((id) => currentIds.has(id));
      if (!sameSet) {
        return {
          status: 409,
          body: { message: "El cronograma cambió mientras lo editabas. Recarga la página e inténtalo de nuevo." },
        };
      }

      for (const [position, id] of activityIds.entries()) {
        await ScheduleActivity.update({ position }, { where: { id }, transaction });
      }
      return { status: 200, body: { message: "Orden actualizado", activities: await loadActivities(ev.id, transaction) } };
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("reorderActivities:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** PUT /api/admin/event/:id/schedule/visibility — body: { published } */
export const setScheduleVisibility = async (req, res) => {
  try {
    const ev = await Event.findByPk(req.params.id);
    if (!ev) return res.status(404).json(EVENT_NOT_FOUND);

    const { published } = req.body;
    if (published && (await ScheduleActivity.count({ where: { eventId: ev.id } })) === 0) {
      return res.status(400).json({ message: "Agrega al menos una actividad antes de publicar el cronograma" });
    }

    await ev.update({ schedulePublished: published });
    res.json({
      message: published ? "Cronograma publicado" : "Cronograma oculto",
      schedulePublished: ev.schedulePublished,
    });
  } catch (err) {
    console.error("setScheduleVisibility:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
//  PARTICIPANTE
// ===============================

/**
 * GET /api/user/schedule — cronograma del evento actual (req.participant).
 * Un borrador (no publicado) nunca se expone: se responde como "sin cronograma".
 */
export const getMySchedule = async (req, res) => {
  try {
    const event = req.participant.Event;
    const activities = event.schedulePublished ? await loadActivities(event.id) : [];

    res.json({
      available: activities.length > 0,
      activities,
      version: activities.length > 0 ? scheduleVersion(activities) : null,
    });
  } catch (err) {
    console.error("getMySchedule:", err);
    res.status(500).json({ message: "Server error" });
  }
};
