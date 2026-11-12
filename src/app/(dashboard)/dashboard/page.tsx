'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, Flame, TrendingUp, Activity } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'

export default function DashboardPage() {
  const { userId } = useUser()
  const [stats, setStats] = useState({ exercises: 0, sets: 0, calories: 0, weekSessions: 0 })
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [topProgress, setTopProgress] = useState<{ exercise: string; diff: number } | null>(null)
  const [name, setName] = useState('Athlete')

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd')

    async function load() {
      const [profileRes, todayRes, nutritionRes, weekRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', userId).single(),
        supabase.from('workout_sessions').select('*, exercise_logs(*)').eq('user_id', userId).eq('date', today),
        supabase.from('nutrition_logs').select('calories').eq('user_id', userId).eq('date', today),
        supabase.from('workout_sessions').select('id').eq('user_id', userId).gte('date', weekStart).lte('date', weekEnd),
        supabase.from('exercise_logs').select('exercise_name, weight, created_at').eq('user_id', userId).gte('created_at', new Date(startOfWeek(new Date())).toISOString()).order('created_at'),
      ])

      setName(profileRes.data?.name || 'Athlete')
      setTodaySessions(todayRes.data || [])

      const totalExercises = (todayRes.data || []).reduce((a: number, s: any) => a + (s.exercise_logs?.length || 0), 0)
      const totalSets = (todayRes.data || []).reduce((a: number, s: any) => a + (s.exercise_logs?.reduce((b: number, e: any) => b + e.sets, 0) || 0), 0)
      const totalCalories = (nutritionRes.data || []).reduce((a: number, n: any) => a + n.calories, 0)
      setStats({ exercises: totalExercises, sets: totalSets, calories: totalCalories, weekSessions: weekRes.data?.length || 0 })

      const exMap: Record<string, number[]> = {}
      logsRes.data?.forEach((l: any) => {
        if (!exMap[l.exercise_name]) exMap[l.exercise_name] = []
        exMap[l.exercise_name].push(l.weight)
      })
      let top: { exercise: string; diff: number } | null = null
      for (const [name, weights] of Object.entries(exMap)) {
        if (weights.length >= 2) {
          const diff = weights[weights.length - 1] - weights[0]
          if (!top || diff > top.diff) top = { exercise: name, diff }
        }
      }
      setTopProgress(top)
    }
    load()
  }, [userId])

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
        <StatCard icon={<Dumbbell className="w-5 h-5 text-primary" />} label="Exercises" value={stats.exercises.toString()} bg="bg-green-50" />
        <StatCard icon={<Activity className="w-5 h-5 text-blue-500" />} label="Total Sets" value={stats.sets.toString()} bg="bg-blue-50" />
        <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} label="Calories" value={`${stats.calories} kcal`} bg="bg-orange-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-500" />} label="This Week" value={`${stats.weekSessions} sessions`} bg="bg-purple-50" />
      </div>

      {topProgress && topProgress.diff > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🏆 Top Improvement This Week</h2>
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <p className="text-sm opacity-90 mb-1">Best Progress</p>
              <p className="font-bold text-lg">{topProgress.exercise}</p>
              <Badge className="bg-white/20 text-white border-0 text-sm font-bold mt-2">+{topProgress.diff} KG ✅</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {todaySessions.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Workout</h2>
          <div className="space-y-2">
            {todaySessions.map((session: any) => (
              <Card key={session.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{session.muscle_group}</Badge>
                    <span className="text-xs text-gray-400">{session.exercise_logs?.length || 0} exercises</span>
                  </div>
                  {session.exercise_logs?.slice(0, 3).map((ex: any) => (
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
