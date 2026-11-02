// Cronograma demo (el que antes estaba fijo en TimelineModal.jsx), publicado
// en "Navidad 2026 (demo)". "Navidad 2025 (demo)" queda sin cronograma para
// probar que en ese caso no se muestra nada.
import { QueryTypes } from "sequelize";

const EVENT_TITLE = "Navidad 2026 (demo)";

const ACTIVITIES = [
  {
    startTime: "18:00", icon: "🥤", title: "ARMAR TORRE DE VASOS 1 VS 1", participantsLabel: "10 personas",
    referenceUrl: "https://www.tiktok.com/@beefamilygames/video/7229140258967850282",
    prizes: ["3 MINI VENTILADORES PERSONAL", "1 LENTES BLUETOOTH SUNGLASSES", "1 LENTES BLUETOOTH"],
  },
  {
    startTime: "18:30", icon: "🏗️", title: "COPAS DE TORRE 3 VS 3 VS 3", participantsLabel: "9 personas",
    referenceUrl: "https://www.tiktok.com/@danielbalba/video/7319470190306004230",
    prizes: ["3 AUDIFONO P9"],
  },
  { startTime: "19:00", icon: "🎱", title: "BINGO", participantsLabel: "TODOS", prizes: ["1 MORRAL"] },
  {
    startTime: "20:00", icon: "🎾", title: "TORRE DE VASOS CON BOLA", participantsLabel: "3 personas",
    referenceUrl: "https://www.tiktok.com/@paocastillooficial/video/7446301480556006662",
    prizes: ["1 HERVIDOR HUEVOS ELECTRICOS"],
  },
  {
    startTime: "20:30", icon: "😂", title: "EL QUE SE RIE PIERDE", participantsLabel: "6 personas",
    description: "SE VAN A MIRAR FRENTE A FRENTE Y EL QUE SE RIE PIERDE",
    prizes: ["1 MINI VENTILADOR ELECTRICO"],
  },
  {
    startTime: "21:00", icon: "🌑", title: "BINGO APAGON", participantsLabel: "TODOS",
    prizes: ["1 SECADORA DE CABELLO", "1 PARLANTE INALAMBRICO"],
  },
  { startTime: "21:30", icon: "🎁", title: "INTERCAMBIO DE REGALOS", participantsLabel: "TODOS", prizes: [] },
];

export const up = async ({ context: qi }) => {
  const { sequelize } = qi;
  const now = new Date();
  const stamps = { createdAt: now, updatedAt: now };

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements) => sequelize.query(sql, { type: QueryTypes.SELECT, replacements, transaction });

    const [event] = await select("SELECT id FROM events WHERE title = :title ORDER BY id DESC LIMIT 1", { title: EVENT_TITLE });
    if (!event) throw new Error(`No existe el evento "${EVENT_TITLE}": ejecuta antes 20261102-0001-demo-data`);

    for (const [position, { prizes, ...activity }] of ACTIVITIES.entries()) {
      await qi.bulkInsert(
        "scheduleActivities",
        [{
          eventId: event.id, position, description: null, referenceUrl: null,
          ...activity, startTime: `${activity.startTime}:00`, ...stamps,
        }],
        { transaction }
      );
      const [{ id }] = await select(
        "SELECT id FROM scheduleActivities WHERE eventId = :eventId AND position = :position",
        { eventId: event.id, position }
      );
      if (prizes.length > 0) {
        await qi.bulkInsert(
          "scheduleActivityPrizes",
          prizes.map((description, i) => ({ activityId: id, position: i, description, ...stamps })),
          { transaction }
        );
      }
    }

    await qi.bulkUpdate("events", { schedulePublished: true }, { id: event.id }, { transaction });
  });
};

export const down = async ({ context: qi }) => {
  const [event] = await qi.sequelize.query("SELECT id FROM events WHERE title = :title ORDER BY id DESC LIMIT 1", {
    type: QueryTypes.SELECT,
    replacements: { title: EVENT_TITLE },
  });
  if (!event) return;
  // Los premios caen en cascada con las actividades.
  await qi.bulkDelete("scheduleActivities", { eventId: event.id });
  await qi.bulkUpdate("events", { schedulePublished: false }, { id: event.id });
};
