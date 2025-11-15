CREATE DATABASE amigo_secreto_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('admin','user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_event DATE,
  createdBy INT, -- FK a users.id (admin)
  drawDone BOOLEAN DEFAULT FALSE,
  drawDate DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  userId INT NULL, -- si se registra como usuario del sistema
  phone VARCHAR(20) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE giftOptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participantId INT NOT NULL,
  title VARCHAR(255),
  note TEXT,
  donation VARCHAR(255), -- ejemplo: "llevaré panetón"
  link VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participantId) REFERENCES participants(id)
);

CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  giverParticipantId INT NOT NULL,
  receiverParticipantId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id),
  FOREIGN KEY (giverParticipantId) REFERENCES participants(id),
  FOREIGN KEY (receiverParticipantId) REFERENCES participants(id)
);

INSERT INTO users (firstName, lastName, phone, password, role)
VALUES ("admin", "admin", "999999999", "$2b$10$EMxCsdfTysTs4EsmKIx20OKAGdr0A5oXGCEVD0qJxH3LPBt.ujmsO", "admin");