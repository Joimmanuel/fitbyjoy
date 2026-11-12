export type MuscleGroup = 'Chest' | 'Back' | 'Shoulder' | 'Leg' | 'Biceps' | 'Triceps' | 'Full Body'
export type WeightUnit = 'KG' | 'LBS'

export interface ExerciseLog {
  id: string
  exercise_name: string
  weight: number
  unit: WeightUnit
  sets: number
  reps: number
}

export interface WorkoutSession {
  id: string
  date: string
  muscle_group: MuscleGroup
  exercises: ExerciseLog[]
}

export interface NutritionLog {
  id: string
  date: string
  food_name: string
  quantity: number
  calories: number
}

export interface BodyWeightLog {
  id: string
  date: string
  weight: number
}

export interface AppSettings {
  name: string
  target_calories: number
}
