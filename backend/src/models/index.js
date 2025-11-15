// src/models/index.js
import DataTypes from "sequelize";
import sequelize from "../config/database.js";

import defineUser from "./User.js";
import defineEvent from "./Event.js";
import defineParticipant from "./Participant.js";
import defineGiftOption from "./GiftOption.js";
import defineAssignment from "./Assignment.js";

const User = defineUser(sequelize, DataTypes);
const Event = defineEvent(sequelize, DataTypes);
const Participant = defineParticipant(sequelize, DataTypes);
const GiftOption = defineGiftOption(sequelize, DataTypes);
const Assignment = defineAssignment(sequelize, DataTypes);

/** Associations */
// Event <-> Participant
Event.hasMany(Participant, { foreignKey: "eventId", onDelete: "CASCADE" });
Participant.belongsTo(Event, { foreignKey: "eventId" });

// User <-> Participant (optional)
User.hasMany(Participant, { foreignKey: "userId" });
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

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    await sequelize.sync({ alter: true }); // en dev: sincroniza cambios
    console.log("Models synchronized!");
  } catch (err) {
    console.error("DB connection error:", err);
    throw err;
  }
};

export {
  sequelize,
  DataTypes,
  User,
  Event,
  Participant,
  GiftOption,
  Assignment,
  connectDB,
};
