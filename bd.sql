-- =====================================================================
-- Amigo Secreto - esquema de referencia
-- ---------------------------------------------------------------------
-- La fuente de verdad del esquema son las migraciones en
-- backend/src/database/migrations. Forma recomendada de crear la BD:
--
--   cd backend
--   npm run db:setup     # crea la BD, aplica migraciones y carga datos demo
--
-- Este script equivale al resultado de las migraciones y sirve para
-- consultar el modelo o instalarlo a mano (phpMyAdmin). Es compatible con
-- ellas: si después se ejecuta `npm run db:migrate`, las migraciones
-- detectan las tablas existentes y no las duplican.
-- No incluye usuarios: el admin se crea con `npm run db:admin` o con el seed.
-- Compatible con MySQL 8 y MariaDB 10.4+.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS amigo_secreto_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE amigo_secreto_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY users_phone_unique (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_event DATE NULL,
  createdBy INT NULL,
  drawDone TINYINT(1) NOT NULL DEFAULT 0,
  drawDate DATETIME NULL,
  schedulePublished TINYINT(1) NOT NULL DEFAULT 0,  -- cronograma visible para participantes
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_createdBy FOREIGN KEY (createdBy)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  userId INT NULL,               -- se vincula cuando la persona se registra
  phone VARCHAR(20) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY participants_event_phone_unique (eventId, phone),
  CONSTRAINT fk_participants_eventId FOREIGN KEY (eventId)
    REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_participants_userId FOREIGN KEY (userId)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS giftOptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participantId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT,
  donation VARCHAR(255),         -- ejemplo: "llevaré panetón"
  link VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_giftOptions_participantId FOREIGN KEY (participantId)
    REFERENCES participants(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  giverParticipantId INT NOT NULL,
  receiverParticipantId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY assignments_event_giver_unique (eventId, giverParticipantId),
  UNIQUE KEY assignments_event_receiver_unique (eventId, receiverParticipantId),
  CONSTRAINT fk_assignments_eventId FOREIGN KEY (eventId)
    REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_assignments_giverParticipantId FOREIGN KEY (giverParticipantId)
    REFERENCES participants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_assignments_receiverParticipantId FOREIGN KEY (receiverParticipantId)
    REFERENCES participants(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cronograma de actividades de un evento (gestionado por el admin)
CREATE TABLE IF NOT EXISTS scheduleActivities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  position INT NOT NULL,         -- orden manual (el cronograma puede cruzar la medianoche)
  startTime TIME NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  participantsLabel VARCHAR(50), -- ejemplo: "10 personas", "TODOS"
  icon VARCHAR(16),
  referenceUrl VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY schedule_activities_event_position (eventId, position),
  CONSTRAINT fk_scheduleActivities_eventId FOREIGN KEY (eventId)
    REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scheduleActivityPrizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activityId INT NOT NULL,
  position INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scheduleActivityPrizes_activityId FOREIGN KEY (activityId)
    REFERENCES scheduleActivities(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
