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
    { name: 'Chest Press Machine', img: '/exercises/chest-press-machine.jpg', sets: 4, reps: 12 },
    { name: 'Incline Press Machine', img: '/exercises/incline-press-machine.jpg', sets: 3, reps: 12 },
    { name: 'Pec Deck', img: '/exercises/pec-deck.jpg', sets: 3, reps: 15 },
    { name: 'Cable Fly', img: '/exercises/cable-fly.jpg', sets: 3, reps: 15 },
    { name: 'Smith Machine Bench Press', img: '/exercises/smith-bench-press.jpg', sets: 4, reps: 10 },
  ],
  Back: [
    { name: 'Lat Pulldown', img: '/exercises/lat-pulldown.jpg', sets: 4, reps: 12 },
    { name: 'Seated Row', img: '/exercises/seated-row.jpg', sets: 4, reps: 12 },
    { name: 'T Bar Row', img: '/exercises/t-bar-row.jpg', sets: 3, reps: 10 },
    { name: 'Pull Up Assistance Machine', img: '/exercises/pull-up-assist.jpg', sets: 3, reps: 10 },
    { name: 'Cable Row', img: '/exercises/cable-row.jpg', sets: 3, reps: 12 },
    { name: 'Low Row', img: '/exercises/low-row.jpg', sets: 3, reps: 12 },
  ],
  Shoulder: [
    { name: 'Shoulder Press Machine', img: '/exercises/shoulder-press-machine.jpg', sets: 4, reps: 12 },
    { name: 'Lateral Raise Machine', img: '/exercises/lateral-raise.jpg', sets: 3, reps: 15 },
    { name: 'Rear Delt Fly', img: '/exercises/rear-delt-fly.jpg', sets: 3, reps: 15 },
    { name: 'Cable Front Raise', img: '/exercises/cable-front-raise.jpg', sets: 3, reps: 12 },
  ],
  Triceps: [
    { name: 'Seated Tricep Extension', img: '/exercises/tricep-extension.jpg', sets: 3, reps: 15 },
    { name: 'Cable Pushdown', img: '/exercises/cable-pushdown.jpg', sets: 3, reps: 15 },
    { name: 'Rope Pushdown', img: '/exercises/rope-pushdown.jpg', sets: 3, reps: 15 },
    { name: 'Assisted Dip Machine', img: '/exercises/assisted-dip.jpg', sets: 3, reps: 12 },
    { name: 'Overhead Extension', img: '/exercises/overhead-extension.jpg', sets: 3, reps: 12 },
  ],
  Biceps: [
    { name: 'Preacher Curl Machine', img: '/exercises/preacher-curl.jpg', sets: 3, reps: 12 },
    { name: 'Cable Curl', img: '/exercises/cable-curl.jpg', sets: 3, reps: 12 },
    { name: 'Hammer Curl', img: '/exercises/hammer-curl.jpg', sets: 3, reps: 12 },
    { name: 'EZ Curl Bar', img: '/exercises/ez-curl.jpg', sets: 4, reps: 10 },
    { name: 'Camber Curl', img: '/exercises/camber-curl.jpg', sets: 3, reps: 12 },
  ],
  Leg: [
    { name: 'Leg Press', img: '/exercises/leg-press.jpg', sets: 4, reps: 12 },
    { name: 'Leg Extension', img: '/exercises/leg-extension.jpg', sets: 3, reps: 15 },
    { name: 'Leg Curl', img: '/exercises/leg-curl.jpg', sets: 3, reps: 15 },
    { name: 'Calf Raise Machine', img: '/exercises/calf-raise.jpg', sets: 4, reps: 20 },
    { name: 'Hack Squat', img: '/exercises/hack-squat.jpg', sets: 4, reps: 10 },
  ],
  'Full Body': [
    { name: 'Deadlift', img: '/exercises/deadlift.jpg', sets: 4, reps: 8 },
    { name: 'Squat', img: '/exercises/squat.jpg', sets: 4, reps: 10 },
    { name: 'Barbell Row', img: '/exercises/barbell-row.jpg', sets: 4, reps: 10 },
    { name: 'Overhead Press', img: '/exercises/overhead-press.jpg', sets: 3, reps: 10 },
    { name: 'Pull Up', img: '/exercises/pull-up.jpg', sets: 3, reps: 8 },
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

// Protein estimates in grams per serving
export const FOOD_PROTEIN: Record<string, number> = {
  'nasi ayam': 30, 'nasi goreng': 12, 'nasi putih': 3, 'nasi uduk': 5,
  'ayam goreng': 28, 'ayam bakar': 26, 'ayam rebus': 25,
  'telur rebus': 6, 'telur goreng': 6, 'telur dadar': 7,
  'pisang': 1, 'apel': 0, 'jeruk': 1, 'semangka': 1,
  'roti tawar': 3, 'roti gandum': 4,
  'mie goreng': 10, 'mie rebus': 8, 'indomie': 8,
  'gado gado': 12, 'soto ayam': 18, 'bakso': 14, 'sate ayam': 22, 'rendang': 28,
  'tempe goreng': 11, 'tahu goreng': 8,
  'sayur bayam': 3, 'sayur kangkung': 2,
  'susu': 8, 'yogurt': 10, 'protein shake': 25, 'oatmeal': 5,
  'granola': 4, 'salad': 3, 'sandwich': 15, 'burger': 20,
  'pizza': 12, 'kentang goreng': 3, 'ubi rebus': 2, 'singkong rebus': 1,
}

export function estimateProtein(foodName: string): number {
  const lower = foodName.toLowerCase().trim()
  if (FOOD_PROTEIN[lower]) return FOOD_PROTEIN[lower]
  for (const [key, protein] of Object.entries(FOOD_PROTEIN)) {
    if (lower.includes(key) || key.includes(lower)) return protein
  }
  // fallback: estimate ~10% of calories as protein calories / 4
  return Math.round(estimateCalories(foodName) * 0.1 / 4)
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
