export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Dumbbell, Flame, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const [profileRes, todaySessionRes, todayNutritionRes, weekSessionsRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user!.id).single(),
    supabase.from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', user!.id)
      .eq('date', todayStr),
    supabase.from('nutrition_logs')
      .select('calories')
      .eq('user_id', user!.id)
      .eq('date', todayStr),
    supabase.from('workout_sessions')
      .select('id, muscle_group')
      .eq('user_id', user!.id)
      .gte('date', format(startOfWeek(today), 'yyyy-MM-dd'))
      .lte('date', format(endOfWeek(today), 'yyyy-MM-dd')),
  ])

  const profile = profileRes.data
  const todaySessions = todaySessionRes.data || []
  const todayNutrition = todayNutritionRes.data || []

  const totalExercises = todaySessions.reduce((acc, s) => acc + (s.exercise_logs?.length || 0), 0)
  const totalSets = todaySessions.reduce((acc, s) =>
    acc + (s.exercise_logs?.reduce((a: number, e: { sets: number }) => a + e.sets, 0) || 0), 0)
  const totalCalories = todayNutrition.reduce((acc, n) => acc + n.calories, 0)
  const weekWorkouts = weekSessionsRes.data?.length || 0

  // Top progress this week
  const exerciseLogsRes = await supabase
    .from('exercise_logs')
    .select('exercise_name, weight, unit, created_at')
    .eq('user_id', user!.id)
    .gte('created_at', new Date(startOfWeek(today)).toISOString())
    .order('created_at', { ascending: true })

  const exerciseLogs = exerciseLogsRes.data || []
  const exerciseMap: Record<string, number[]> = {}
  exerciseLogs.forEach(log => {
    if (!exerciseMap[log.exercise_name]) exerciseMap[log.exercise_name] = []
    exerciseMap[log.exercise_name].push(log.weight)
  })

  let topProgress: { exercise: string; diff: number; unit: string } | null = null
  for (const [name, weights] of Object.entries(exerciseMap)) {
    if (weights.length >= 2) {
      const diff = weights[weights.length - 1] - weights[0]
      if (!topProgress || diff > topProgress.diff) {
        topProgress = { exercise: name, diff, unit: 'KG' }
      }
    }
  }

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Athlete'}</h1>
        <p className="text-sm text-gray-400">{format(today, 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Today's Stats */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Summary</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Dumbbell className="w-5 h-5 text-primary" />}
          label="Exercises"
          value={totalExercises.toString()}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          label="Total Sets"
          value={totalSets.toString()}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Calories"
          value={`${totalCalories} kcal`}
          bg="bg-orange-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          label="This Week"
          value={`${weekWorkouts} sessions`}
          bg="bg-purple-50"
        />
      </div>

      {/* Top Progress */}
      {topProgress && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 Top Improvement This Week</h2>
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm opacity-90 mb-1">Best Progress</p>
              <p className="font-bold text-lg">{topProgress.exercise}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0 text-sm font-bold">
                  +{topProgress.diff} {topProgress.unit} ✅
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Workout */}
      {todaySessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Workout</h2>
          <div className="space-y-2">
            {todaySessions.map((session) => (
              <Card key={session.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{session.muscle_group}</Badge>
                    <span className="text-xs text-gray-400">{session.exercise_logs?.length || 0} exercises</span>
                  </div>
                  {session.exercise_logs?.slice(0, 3).map((log: { id: string; exercise_name: string; weight: number; unit: string; sets: number; reps: number }) => (
                    <div key={log.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700 truncate flex-1">{log.exercise_name}</span>
                      <span className="text-gray-500 ml-2 shrink-0">{log.weight}{log.unit} · {log.sets}×{log.reps}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {todaySessions.length === 0 && (
        <Card className="border-0 shadow-sm border-dashed border-2 border-gray-200 bg-transparent">
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
        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
          {icon}
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-base">{value}</p>
      </CardContent>
    </Card>
  )
}
