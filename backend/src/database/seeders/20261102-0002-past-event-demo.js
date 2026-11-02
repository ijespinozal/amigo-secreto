// Evento pasado y ya sorteado, para probar en local:
//   - el selector de eventos (Ana, Luis, María y Carlos están en 2 eventos);
//   - la vista de "Mi amigo secreto" con el sorteo realizado.
// Depende de los usuarios creados por 20261102-0001-demo-data.
import { QueryTypes } from "sequelize";

const EVENT_TITLE = "Navidad 2025 (demo)";
const PHONES = ["900000001", "900000002", "900000003", "900000004"];

export const up = async ({ context: qi }) => {
  const { sequelize } = qi;
  const now = new Date();
  const stamps = { createdAt: now, updatedAt: now };

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements) =>
      sequelize.query(sql, { type: QueryTypes.SELECT, replacements, transaction });

    const users = await select(
      "SELECT id, phone, firstName, lastName FROM users WHERE phone IN (:phones) ORDER BY phone",
      { phones: PHONES }
    );
    if (users.length !== PHONES.length) {
      throw new Error("Faltan los usuarios demo: ejecuta antes 20261102-0001-demo-data");
    }

    await qi.bulkInsert(
      "events",
      [
        {
          title: EVENT_TITLE,
          description: "Evento pasado de prueba (ya sorteado)",
          date_event: "2025-12-24",
          drawDone: true,
          drawDate: new Date("2025-12-01T15:00:00Z"),
          ...stamps,
        },
      ],
      { transaction }
    );
    const [event] = await select("SELECT id FROM events WHERE title = :title ORDER BY id DESC LIMIT 1", {
      title: EVENT_TITLE,
    });

    await qi.bulkInsert(
      "participants",
      users.map((u) => ({
        eventId: event.id,
        userId: u.id,
        phone: u.phone,
        firstName: u.firstName,
        lastName: u.lastName,
        ...stamps,
      })),
      { transaction }
    );
    const participants = await select(
      "SELECT id FROM participants WHERE eventId = :eventId ORDER BY phone",
      { eventId: event.id }
    );

    // Sorteo fijo en ciclo (Ana -> Luis -> María -> Carlos -> Ana) para que sea reproducible.
    await qi.bulkInsert(
      "assignments",
      participants.map((p, i) => ({
        eventId: event.id,
        giverParticipantId: p.id,
        receiverParticipantId: participants[(i + 1) % participants.length].id,
        ...stamps,
      })),
      { transaction }
    );

    await qi.bulkInsert(
      "giftOptions",
      [{ participantId: participants[1].id, title: "Bufanda", note: "Color rojo", donation: null, link: null, ...stamps }],
      { transaction }
    );
  });
};

export const down = async ({ context: qi }) => {
  // Participantes, regalos y asignaciones se eliminan en cascada con el evento.
  await qi.bulkDelete("events", { title: EVENT_TITLE });
};
