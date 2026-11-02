// src/models/index.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

import defineUser from "./User.js";
import defineEvent from "./Event.js";
import defineParticipant from "./Participant.js";
import defineGiftOption from "./GiftOption.js";
import defineAssignment from "./Assignment.js";
import defineScheduleActivity from "./ScheduleActivity.js";
import defineScheduleActivityPrize from "./ScheduleActivityPrize.js";

const User = defineUser(sequelize, DataTypes);
const Event = defineEvent(sequelize, DataTypes);
const Participant = defineParticipant(sequelize, DataTypes);
const GiftOption = defineGiftOption(sequelize, DataTypes);
const Assignment = defineAssignment(sequelize, DataTypes);
const ScheduleActivity = defineScheduleActivity(sequelize, DataTypes);
const ScheduleActivityPrize = defineScheduleActivityPrize(sequelize, DataTypes);

/** Associations */
// Event <-> Participant
Event.hasMany(Participant, { foreignKey: "eventId", onDelete: "CASCADE" });
Participant.belongsTo(Event, { foreignKey: "eventId" });

// User <-> Participant (optional)
User.hasMany(Participant, { foreignKey: "userId", onDelete: "SET NULL" });
Participant.belongsTo(User, { foreignKey: "userId" });

// Participant <-> GiftOption
Participant.hasMany(GiftOption, { foreignKey: "participantId", onDelete: "CASCADE" });
GiftOption.belongsTo(Participant, { foreignKey: "participantId" });

// Event <-> Assignment
Event.hasMany(Assignment, { foreignKey: "eventId", onDelete: "CASCADE" });
Assignment.belongsTo(Event, { foreignKey: "eventId" });

// Assignment <-> Participant (giver / receiver)
Participant.hasMany(Assignment, { foreignKey: "giverParticipantId", as: "givenAssignments" });
Assignment.belongsTo(Participant, { foreignKey: "giverParticipantId", as: "giver" });

Participant.hasMany(Assignment, { foreignKey: "receiverParticipantId", as: "receivedAssignments" });
Assignment.belongsTo(Participant, { foreignKey: "receiverParticipantId", as: "receiver" });

// Event <-> ScheduleActivity <-> ScheduleActivityPrize (cronograma)
Event.hasMany(ScheduleActivity, { foreignKey: "eventId", as: "activities", onDelete: "CASCADE" });
ScheduleActivity.belongsTo(Event, { foreignKey: "eventId" });

ScheduleActivity.hasMany(ScheduleActivityPrize, { foreignKey: "activityId", as: "prizes", onDelete: "CASCADE" });
ScheduleActivityPrize.belongsTo(ScheduleActivity, { foreignKey: "activityId" });

// El esquema lo gestionan exclusivamente las migraciones (src/database/migrations).
// No se usa sequelize.sync(): con `alter` duplicaba índices en cada arranque y
// sin él no aplicaba cambios a tablas existentes.
const connectDB = async () => {
  await sequelize.authenticate();
  console.log("Database connected!");
};

export {
  sequelize,
  DataTypes,
  User,
  Event,
  Participant,
  GiftOption,
  Assignment,
  ScheduleActivity,
  ScheduleActivityPrize,
  connectDB,
};
