import { MuscleGroup } from '@/types'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulder', 'Leg', 'Biceps', 'Triceps', 'Full Body'
]

export const EXERCISE_RECOMMENDATIONS: Record<MuscleGroup, string[]> = {
  Chest: [
    'Chest Press Machine',
    'Incline Press Machine',
    'Pec Deck',
    'Cable Fly',
    'Smith Machine Bench Press',
  ],
  Back: [
    'Lat Pulldown',
    'Seated Row',
    'T Bar Row',
    'Pull Up Assistance Machine',
    'Cable Row',
  ],
  Shoulder: [
    'Shoulder Press Machine',
    'Lateral Raise Machine',
    'Rear Delt Fly',
    'Cable Front Raise',
  ],
  Triceps: [
    'Seated Tricep Extension',
    'Cable Pushdown',
    'Rope Pushdown',
    'Assisted Dip Machine',
    'Overhead Extension',
  ],
  Biceps: [
    'Preacher Curl Machine',
    'Cable Curl',
    'Hammer Curl',
    'EZ Curl Bar',
  ],
  Leg: [
    'Leg Press',
    'Leg Extension',
    'Leg Curl',
    'Calf Raise Machine',
    'Hack Squat',
  ],
  'Full Body': [
    'Deadlift',
    'Squat',
    'Barbell Row',
    'Overhead Press',
    'Pull Up',
  ],
}

export const FOOD_CALORIES: Record<string, number> = {
  'nasi ayam': 650,
  'nasi goreng': 520,
  'nasi putih': 200,
  'nasi uduk': 300,
  'ayam goreng': 320,
  'ayam bakar': 280,
  'ayam rebus': 220,
  'telur rebus': 70,
  'telur goreng': 90,
  'telur dadar': 100,
  'pisang': 110,
  'apel': 80,
  'jeruk': 60,
  'semangka': 50,
  'roti tawar': 80,
  'roti gandum': 90,
  'mie goreng': 450,
  'mie rebus': 350,
  'indomie': 380,
  'gado gado': 400,
  'soto ayam': 300,
  'bakso': 350,
  'sate ayam': 280,
  'rendang': 450,
  'tempe goreng': 160,
  'tahu goreng': 120,
  'sayur bayam': 50,
  'sayur kangkung': 45,
  'susu': 150,
  'yogurt': 120,
  'protein shake': 200,
  'oatmeal': 150,
  'granola': 200,
  'salad': 100,
  'sandwich': 350,
  'burger': 550,
  'pizza': 280,
  'kentang goreng': 320,
  'ubi rebus': 130,
  'singkong rebus': 150,
}

export function estimateCalories(foodName: string): number {
  const lower = foodName.toLowerCase().trim()
  if (FOOD_CALORIES[lower]) return FOOD_CALORIES[lower]
  for (const [key, cal] of Object.entries(FOOD_CALORIES)) {
    if (lower.includes(key) || key.includes(lower)) return cal
  }
  return 200
}

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Chest: '#ef4444',
  Back: '#3b82f6',
  Shoulder: '#f59e0b',
  Leg: '#00BFA5',
  Biceps: '#8b5cf6',
  Triceps: '#1AD1B9',
  'Full Body': '#00897B',
}
