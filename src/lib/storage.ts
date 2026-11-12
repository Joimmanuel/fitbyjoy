import { WorkoutSession, NutritionLog, BodyWeightLog, AppSettings } from '@/types'

const KEYS = {
  workouts: 'joyfit_workouts',
  nutrition: 'joyfit_nutrition',
  bodyweight: 'joyfit_bodyweight',
  settings: 'joyfit_settings',
}

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getWorkouts(): WorkoutSession[] {
  return get<WorkoutSession[]>(KEYS.workouts, [])
}

export function saveWorkout(session: WorkoutSession) {
  const all = getWorkouts()
  set(KEYS.workouts, [session, ...all])
}

export function deleteWorkout(id: string) {
  set(KEYS.workouts, getWorkouts().filter(w => w.id !== id))
}

export function getNutritionLogs(): NutritionLog[] {
  return get<NutritionLog[]>(KEYS.nutrition, [])
}

export function saveNutritionLog(log: NutritionLog) {
  const all = getNutritionLogs()
  set(KEYS.nutrition, [...all, log])
}

export function deleteNutritionLog(id: string) {
  set(KEYS.nutrition, getNutritionLogs().filter(n => n.id !== id))
}

export function getBodyWeightLogs(): BodyWeightLog[] {
  return get<BodyWeightLog[]>(KEYS.bodyweight, [])
}

export function saveBodyWeightLog(log: BodyWeightLog) {
  const all = getBodyWeightLogs()
  set(KEYS.bodyweight, [log, ...all])
}

export function getSettings(): AppSettings {
  return get<AppSettings>(KEYS.settings, { name: 'Athlete', target_calories: 2000 })
}

export function saveSettings(settings: AppSettings) {
  set(KEYS.settings, settings)
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
