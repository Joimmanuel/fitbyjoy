export type MuscleGroup = 'Chest' | 'Back' | 'Shoulder' | 'Leg' | 'Biceps' | 'Triceps' | 'Full Body'
export type WeightUnit = 'KG' | 'LBS'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  target_calories: number
  target_weight: number | null
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  date: string
  muscle_group: MuscleGroup
  notes: string | null
  created_at: string
  exercise_logs?: ExerciseLog[]
}

export interface ExerciseLog {
  id: string
  session_id: string
  user_id: string
  exercise_name: string
  weight: number
  unit: WeightUnit
  sets: number
  reps: number
  created_at: string
}

export interface NutritionLog {
  id: string
  user_id: string
  date: string
  food_name: string
  quantity: number
  calories: number
  created_at: string
}

export interface BodyWeightLog {
  id: string
  user_id: string
  date: string
  weight: number
  created_at: string
}

export interface ExerciseProgress {
  exercise_name: string
  current_weight: number
  last_weight: number
  diff: number
  unit: WeightUnit
  history: { date: string; weight: number }[]
}

export interface DashboardStats {
  todayExercises: number
  todaySets: number
  todayCalories: number
  topProgress: { exercise: string; diff: number; unit: WeightUnit } | null
}
