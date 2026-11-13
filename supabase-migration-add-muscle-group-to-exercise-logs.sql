-- Migration: add muscle_group to exercise_logs, make workout_sessions.muscle_group nullable
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS muscle_group TEXT;
ALTER TABLE workout_sessions ALTER COLUMN muscle_group DROP NOT NULL;
