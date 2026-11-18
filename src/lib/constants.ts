import { MuscleGroup } from '@/types'

export const MOTIVATIONAL_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Train insane or remain the same.", author: "Unknown" },
  { text: "Sore today, strong tomorrow.", author: "Unknown" },
  { text: "It never gets easier, you just get stronger.", author: "Unknown" },
  { text: "Be stronger than your excuses.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
]

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulder', 'Leg', 'Biceps', 'Triceps', 'Full Body'
]

export type ExerciseInfo = { name: string; img: string; sets: number; reps: number }

export const EXERCISE_RECOMMENDATIONS: Record<MuscleGroup, string[]> = {
  Chest: ['Chest Press Machine','Incline Press Machine','Pec Deck','Cable Fly','Smith Machine Bench Press'],
  Back: ['Lat Pulldown','Seated Row','T Bar Row','Pull Up Assistance Machine','Cable Row'],
  Shoulder: ['Shoulder Press Machine','Lateral Raise Machine','Rear Delt Fly','Cable Front Raise'],
  Triceps: ['Seated Tricep Extension','Cable Pushdown','Rope Pushdown','Assisted Dip Machine','Overhead Extension'],
  Biceps: ['Preacher Curl Machine','Cable Curl','Hammer Curl','EZ Curl Bar'],
  Leg: ['Leg Press','Leg Extension','Leg Curl','Calf Raise Machine','Hack Squat'],
  'Full Body': ['Deadlift','Squat','Barbell Row','Overhead Press','Pull Up'],
}

export const EXERCISE_DETAILS: Record<MuscleGroup, ExerciseInfo[]> = {
  Chest: [
    { name: 'Chest Press Machine', img: 'https://muscles.wiki/img/exercises/chest-press-machine.gif', sets: 4, reps: 12 },
    { name: 'Incline Press Machine', img: 'https://muscles.wiki/img/exercises/incline-bench-press.gif', sets: 3, reps: 12 },
    { name: 'Pec Deck', img: 'https://muscles.wiki/img/exercises/pec-deck-fly.gif', sets: 3, reps: 15 },
    { name: 'Cable Fly', img: 'https://muscles.wiki/img/exercises/cable-fly.gif', sets: 3, reps: 15 },
    { name: 'Smith Machine Bench Press', img: 'https://muscles.wiki/img/exercises/smith-machine-bench-press.gif', sets: 4, reps: 10 },
  ],
  Back: [
    { name: 'Lat Pulldown', img: 'https://muscles.wiki/img/exercises/lat-pulldown.gif', sets: 4, reps: 12 },
    { name: 'Seated Row', img: 'https://muscles.wiki/img/exercises/seated-cable-row.gif', sets: 4, reps: 12 },
    { name: 'T Bar Row', img: 'https://muscles.wiki/img/exercises/t-bar-row.gif', sets: 3, reps: 10 },
    { name: 'Pull Up Assistance Machine', img: 'https://muscles.wiki/img/exercises/assisted-pull-up.gif', sets: 3, reps: 10 },
    { name: 'Cable Row', img: 'https://muscles.wiki/img/exercises/cable-row.gif', sets: 3, reps: 12 },
  ],
  Shoulder: [
    { name: 'Shoulder Press Machine', img: 'https://muscles.wiki/img/exercises/machine-shoulder-press.gif', sets: 4, reps: 12 },
    { name: 'Lateral Raise Machine', img: 'https://muscles.wiki/img/exercises/machine-lateral-raise.gif', sets: 3, reps: 15 },
    { name: 'Rear Delt Fly', img: 'https://muscles.wiki/img/exercises/rear-delt-fly.gif', sets: 3, reps: 15 },
    { name: 'Cable Front Raise', img: 'https://muscles.wiki/img/exercises/cable-front-raise.gif', sets: 3, reps: 12 },
  ],
  Triceps: [
    { name: 'Seated Tricep Extension', img: 'https://muscles.wiki/img/exercises/seated-tricep-extension.gif', sets: 3, reps: 15 },
    { name: 'Cable Pushdown', img: 'https://muscles.wiki/img/exercises/cable-pushdown.gif', sets: 3, reps: 15 },
    { name: 'Rope Pushdown', img: 'https://muscles.wiki/img/exercises/rope-pushdown.gif', sets: 3, reps: 15 },
    { name: 'Assisted Dip Machine', img: 'https://muscles.wiki/img/exercises/assisted-dip.gif', sets: 3, reps: 12 },
    { name: 'Overhead Extension', img: 'https://muscles.wiki/img/exercises/overhead-tricep-extension.gif', sets: 3, reps: 12 },
  ],
  Biceps: [
    { name: 'Preacher Curl Machine', img: 'https://muscles.wiki/img/exercises/preacher-curl.gif', sets: 3, reps: 12 },
    { name: 'Cable Curl', img: 'https://muscles.wiki/img/exercises/cable-curl.gif', sets: 3, reps: 12 },
    { name: 'Hammer Curl', img: 'https://muscles.wiki/img/exercises/hammer-curl.gif', sets: 3, reps: 12 },
    { name: 'EZ Curl Bar', img: 'https://muscles.wiki/img/exercises/ez-bar-curl.gif', sets: 4, reps: 10 },
  ],
  Leg: [
    { name: 'Leg Press', img: 'https://muscles.wiki/img/exercises/leg-press.gif', sets: 4, reps: 12 },
    { name: 'Leg Extension', img: 'https://muscles.wiki/img/exercises/leg-extension.gif', sets: 3, reps: 15 },
    { name: 'Leg Curl', img: 'https://muscles.wiki/img/exercises/leg-curl.gif', sets: 3, reps: 15 },
    { name: 'Calf Raise Machine', img: 'https://muscles.wiki/img/exercises/calf-raise.gif', sets: 4, reps: 20 },
    { name: 'Hack Squat', img: 'https://muscles.wiki/img/exercises/hack-squat.gif', sets: 4, reps: 10 },
  ],
  'Full Body': [
    { name: 'Deadlift', img: 'https://muscles.wiki/img/exercises/deadlift.gif', sets: 4, reps: 8 },
    { name: 'Squat', img: 'https://muscles.wiki/img/exercises/squat.gif', sets: 4, reps: 10 },
    { name: 'Barbell Row', img: 'https://muscles.wiki/img/exercises/barbell-row.gif', sets: 4, reps: 10 },
    { name: 'Overhead Press', img: 'https://muscles.wiki/img/exercises/overhead-press.gif', sets: 3, reps: 10 },
    { name: 'Pull Up', img: 'https://muscles.wiki/img/exercises/pull-up.gif', sets: 3, reps: 8 },
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
