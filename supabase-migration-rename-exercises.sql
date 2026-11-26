-- Migration: Rename exercises to match updated constants
-- Run this in Supabase SQL Editor

UPDATE exercise_logs SET exercise_name = 'Cable Rope Face Pull'       WHERE exercise_name = 'Rear Delt Fly';
UPDATE exercise_logs SET exercise_name = 'Dumbbell Incline Bench Press' WHERE exercise_name = 'Incline Press Machine';
