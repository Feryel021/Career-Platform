-- Career Guidance & Mentorship Portal - database schema
CREATE DATABASE IF NOT EXISTS career_platform CHARACTER SET utf8mb4;
USE career_platform;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','mentor','professional') NOT NULL,
  field VARCHAR(100) DEFAULT NULL,
  experience VARCHAR(100) DEFAULT NULL,
  bio TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mentor_requests (
  id INT NOT NULL AUTO_INCREMENT,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY student_id (student_id),
  KEY mentor_id (mentor_id),
  CONSTRAINT uq_student_mentor UNIQUE (student_id, mentor_id),
  CONSTRAINT mentor_requests_ibfk_1 FOREIGN KEY (student_id) REFERENCES users (id),
  CONSTRAINT mentor_requests_ibfk_2 FOREIGN KEY (mentor_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id INT NOT NULL AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT DEFAULT 0,
  PRIMARY KEY (id),
  KEY sender_id (sender_id),
  KEY receiver_id (receiver_id),
  KEY idx_conversation (sender_id, receiver_id, created_at),
  KEY idx_unread (receiver_id, is_read),
  CONSTRAINT messages_ibfk_1 FOREIGN KEY (sender_id) REFERENCES users (id),
  CONSTRAINT messages_ibfk_2 FOREIGN KEY (receiver_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  location VARCHAR(100) DEFAULT NULL,
  description TEXT,
  type ENUM('full-time','part-time','internship') NOT NULL,
  posted_by INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  apply_link VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY posted_by (posted_by),
  CONSTRAINT jobs_ibfk_1 FOREIGN KEY (posted_by) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resources (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  link VARCHAR(255) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  posted_by INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY posted_by (posted_by),
  CONSTRAINT resources_ibfk_1 FOREIGN KEY (posted_by) REFERENCES users (id)
) ENGINE=InnoDB;
