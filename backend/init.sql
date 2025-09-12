-- Database initialization script for TodoWeb
-- This script runs when the MySQL container starts for the first time

-- Create database if it doesn't exist (already created by MYSQL_DATABASE env var)
-- CREATE DATABASE IF NOT EXISTS todoweb;

-- Use the database
-- USE todoweb;

-- Create user if it doesn't exist (already created by MYSQL_USER env var)
-- CREATE USER IF NOT EXISTS 'todoweb_user'@'%' IDENTIFIED BY 'todoweb_password';
-- GRANT ALL PRIVILEGES ON todoweb.* TO 'todoweb_user'@'%';
-- FLUSH PRIVILEGES;

-- The tables will be created automatically by SQLAlchemy when the backend starts
-- This file is here for any additional database setup if needed

-- Optional: Create indexes for better performance
-- These will be created after the tables are created by the application

-- CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
-- CREATE INDEX IF NOT EXISTS idx_calendar_notes_user_id ON calendar_notes(user_id);
-- CREATE INDEX IF NOT EXISTS idx_calendar_notes_date ON calendar_notes(date);

