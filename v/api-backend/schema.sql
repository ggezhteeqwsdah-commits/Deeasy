CREATE DATABASE IF NOT EXISTS ktcm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE ktcm_db;

CREATE TABLE IF NOT EXISTS `USER` (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  staff_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  position VARCHAR(150) NOT NULL,
  department VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  employee_code VARCHAR(50) NOT NULL,
  position VARCHAR(150) NOT NULL,
  department VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  email VARCHAR(200) NOT NULL DEFAULT '',
  responsibilities TEXT NOT NULL,
  tenure VARCHAR(100) NOT NULL DEFAULT '',
  achievements TEXT NOT NULL,
  projects TEXT NOT NULL,
  work_success TEXT NOT NULL,
  challenges TEXT NOT NULL,
  development_goals TEXT NOT NULL,
  status ENUM('draft', 'submitted', 'completed') NOT NULL DEFAULT 'draft',
  score TINYINT UNSIGNED NULL,
  committee_comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,
  evaluated_at DATETIME NULL,
  CONSTRAINT chk_evaluation_score CHECK (score IS NULL OR score BETWEEN 1 AND 5),
  INDEX idx_evaluations_status (status)
);
