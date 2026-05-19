-- Migration 14: Add name and designation columns to users table
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN designation TEXT;
