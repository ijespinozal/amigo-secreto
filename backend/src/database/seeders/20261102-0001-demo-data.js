// Datos de prueba para desarrollo local. Bloqueado en producción por el CLI.
//
// Credenciales:
//   admin   999999999 / Admin123*
//   users   900000001..900000005 / Navidad2026*
// 900000006 es un participante SIN cuenta: sirve para probar que, al
// registrarse con ese teléfono, el usuario queda vinculado al evento.
import bcrypt from "bcryptjs";
import { QueryTypes } from "sequelize";

const EVENT_TITLE = "Navidad 2026 (demo)";
const ADMIN = { phone: "999999999", firstName: "Admin", lastName: "Demo", password: "Admin123*" };
const USER_PASSWORD = "Navidad2026*";

const USERS = [
  { phone: "900000001", firstName: "Ana", lastName: "Torres" },
  { phone: "900000002", firstName: "Luis", lastName: "Ramírez" },
  { phone: "900000003", firstName: "María", lastName: "Quispe" },
  { phone: "900000004", firstName: "Carlos", lastName: "Mendoza" },
  { phone: "900000005", firstName: "Sofía", lastName: "Paredes" },
];
const UNREGISTERED = { phone: "900000006", firstName: "Pedro", lastName: "Salazar" };

const GIFTS = {
  "900000001": [
    { title: "Audífonos bluetooth", note: "De preferencia negros", donation: "Panetón", link: null },
    { title: "Libro de cocina", note: null, donation: null, link: null },
  ],
  "900000002": [{ title: "Polo talla M", note: "Color azul", donation: "Chocolate caliente", link: null }],
  "900000003": [{ title: "Taza personalizada", note: null, donation: "Galletas", link: null }],
};

const ALL_PHONES = [ADMIN.phone, ...USERS.map((u) => u.phone), UNREGISTERED.phone];

export const up = async ({ context: qi }) => {
  const { sequelize } = qi;
  const now = new Date();
  const stamps = { createdAt: now, updatedAt: now };

  await sequelize.transaction(async (transaction) => {
    const select = (sql, replacements) =>
      sequelize.query(sql, { type: QueryTypes.SELECT, replacements, transaction });

    const existing = await select("SELECT phone FROM users WHERE phone IN (:phones)", { phones: ALL_PHONES });
    const taken = new Set(existing.map((row) => row.phone));

    const [adminHash, userHash] = await Promise.all([
      bcrypt.hash(ADMIN.password, 10),
      bcrypt.hash(USER_PASSWORD, 10),
    ]);

    const newUsers = [
      { ...ADMIN, password: adminHash, role: "admin" },
      ...USERS.map((u) => ({ ...u, password: userHash, role: "user" })),
    ]
      .filter((u) => !taken.has(u.phone))
      .map((u) => ({ ...u, ...stamps }));

    if (newUsers.length > 0) await qi.bulkInsert("users", newUsers, { transaction });

    const users = await select("SELECT id, phone FROM users WHERE phone IN (:phones)", { phones: ALL_PHONES });
    const userIdByPhone = new Map(users.map((u) => [u.phone, u.id]));

    await qi.bulkInsert(
      "events",
      [
        {
          title: EVENT_TITLE,
          description: "Evento de prueba generado por el seeder",
          date_event: "2026-12-24",
          createdBy: userIdByPhone.get(ADMIN.phone),
          drawDone: false,
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
      [...USERS, UNREGISTERED].map((p) => ({
        eventId: event.id,
        userId: userIdByPhone.get(p.phone) ?? null,
        phone: p.phone,
        firstName: p.firstName,
        lastName: p.lastName,
        email: null,
        ...stamps,
      })),
      { transaction }
    );

    const participants = await select("SELECT id, phone FROM participants WHERE eventId = :eventId", {
      eventId: event.id,
    });
    const gifts = participants.flatMap((p) =>
      (GIFTS[p.phone] || []).map((g) => ({ ...g, participantId: p.id, ...stamps }))
    );
    if (gifts.length > 0) await qi.bulkInsert("giftOptions", gifts, { transaction });
  });
};

export const down = async ({ context: qi }) => {
  // Participantes, regalos y asignaciones se eliminan en cascada con el evento.
  await qi.bulkDelete("events", { title: EVENT_TITLE });
  await qi.bulkDelete("users", { phone: ALL_PHONES });
};
