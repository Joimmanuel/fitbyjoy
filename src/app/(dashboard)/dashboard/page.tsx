'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Flame, TrendingUp, Activity } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { getWorkouts, getNutritionLogs, getSettings } from '@/lib/storage'
import { WorkoutSession, NutritionLog } from '@/types'

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])
  const [nutrition, setNutrition] = useState<NutritionLog[]>([])
  const [name, setName] = useState('Athlete')

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd')
    setWorkouts(getWorkouts())
    setNutrition(getNutritionLogs().filter(n => n.date === today))
    setName(getSettings().name)
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todaySessions = workouts.filter(w => w.date === today)
  const weekSessions = workouts.filter(w => w.date >= format(startOfWeek(new Date()), 'yyyy-MM-dd') && w.date <= format(endOfWeek(new Date()), 'yyyy-MM-dd'))
  const totalExercises = todaySessions.reduce((a, s) => a + s.exercises.length, 0)
  const totalSets = todaySessions.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets, 0), 0)
  const totalCalories = nutrition.reduce((a, n) => a + n.calories, 0)

  // Top progress this week
  const weekExercises = weekSessions.flatMap(s => s.exercises)
  const exMap: Record<string, number[]> = {}
  weekExercises.forEach(e => {
    if (!exMap[e.exercise_name]) exMap[e.exercise_name] = []
    exMap[e.exercise_name].push(e.weight)
  })
  let topProgress: { exercise: string; diff: number } | null = null
  for (const [name, weights] of Object.entries(exMap)) {
    if (weights.length >= 2) {
      const diff = weights[weights.length - 1] - weights[0]
      if (!topProgress || diff > topProgress.diff) topProgress = { exercise: name, diff }
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-sm text-gray-500">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <p className="text-sm text-gray-400">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Summary</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={<Dumbbell className="w-5 h-5 text-primary" />} label="Exercises" value={totalExercises.toString()} bg="bg-green-50" />
        <StatCard icon={<Activity className="w-5 h-5 text-blue-500" />} label="Total Sets" value={totalSets.toString()} bg="bg-blue-50" />
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="Calories" value={`${totalCalories} kcal`} bg="bg-orange-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-500" />} label="This Week" value={`${weekSessions.length} sessions`} bg="bg-purple-50" />
      </div>

      {topProgress && topProgress.diff > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 Top Improvement This Week</h2>
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm opacity-90 mb-1">Best Progress</p>
              <p className="font-bold text-lg">{topProgress.exercise}</p>
              <Badge className="bg-white/20 text-white border-0 text-sm font-bold mt-2">
                +{topProgress.diff} KG ✅
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {todaySessions.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Workout</h2>
          <div className="space-y-2">
            {todaySessions.map(session => (
              <Card key={session.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{session.muscle_group}</Badge>
                    <span className="text-xs text-gray-400">{session.exercises.length} exercises</span>
                  </div>
                  {session.exercises.slice(0, 3).map(ex => (
                    <div key={ex.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 truncate flex-1">{ex.exercise_name}</span>
                      <span className="text-gray-500 ml-2 shrink-0">{ex.weight}{ex.unit} · {ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-0 border-dashed border-2 border-gray-200 bg-transparent shadow-none">
          <CardContent className="p-6 text-center">
            <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No workout logged today</p>
            <p className="text-gray-300 text-xs mt-1">Tap Workout to get started 💪</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-base">{value}</p>
      </CardContent>
    </Card>
  )
}
