'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, subWeeks, subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
  const { userId } = useUser()
  const [data, setData] = useState({
    totalWorkoutsMonth: 0,
    mostTrainedMuscle: '',
    strongestExercise: null as { name: string; weight: number; unit: string } | null,
    avgWorkoutsPerWeek: 0,
    streak: 0,
    totalVolume: 0,
    weeklyData: [] as { week: string; count: number; volume: number }[],
    muscleDistribution: [] as { muscle: string; count: number }[],
    weightTrend: [] as { date: string; weight: number }[],
  })

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const today = new Date()

    async function load() {
      const [sessionsRes, logsRes, bodyRes] = await Promise.all([
        supabase.from('workout_sessions').select('id, date, muscle_group').eq('user_id', userId).order('date'),
        supabase.from('exercise_logs').select('exercise_name, weight, unit, sets, reps, created_at').eq('user_id', userId),
        supabase.from('body_weight_logs').select('date, weight').eq('user_id', userId).order('date').limit(30),
      ])

      const allSessions = sessionsRes.data || []
      const allLogs = logsRes.data || []

      // Month stats
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
      const monthSessions = allSessions.filter((s: any) => s.date >= monthStart && s.date <= monthEnd)

      // Muscle distribution
      const muscleCount: Record<string, number> = {}
      allSessions.forEach((s: any) => { muscleCount[s.muscle_group] = (muscleCount[s.muscle_group] || 0) + 1 })
      const mostTrainedMuscle = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
      const muscleDistribution = Object.entries(muscleCount).map(([muscle, count]) => ({ muscle, count })).sort((a, b) => b.count - a.count)

      // Strongest exercise
      const exWeights: Record<string, { weight: number; unit: string }> = {}
      allLogs.forEach((l: any) => {
        if (!exWeights[l.exercise_name] || l.weight > exWeights[l.exercise_name].weight)
          exWeights[l.exercise_name] = { weight: l.weight, unit: l.unit }
      })
      const strongest = Object.entries(exWeights).sort((a, b) => b[1].weight - a[1].weight)[0]
      const strongestExercise = strongest ? { name: strongest[0], ...strongest[1] } : null

      // Total volume (weight × sets × reps)
      const totalVolume = Math.round(allLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0))

      // Weekly data with volume
      const weeklyData = []
      for (let i = 7; i >= 0; i--) {
        const wStart = format(startOfWeek(subWeeks(today, i)), 'yyyy-MM-dd')
        const wEnd = format(startOfWeek(subWeeks(today, i - 1)), 'yyyy-MM-dd')
        const weekSessions = allSessions.filter((s: any) => s.date >= wStart && s.date < wEnd)
        const weekSessionIds = new Set(weekSessions.map((s: any) => s.id))
        const weekLogs = allLogs.filter((l: any) => {
          const logDate = l.created_at?.split('T')[0]
          return logDate >= wStart && logDate < wEnd
        })
        const volume = Math.round(weekLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0))
        weeklyData.push({ week: `W${8 - i}`, count: weekSessions.length, volume })
      }

      const avgWorkoutsPerWeek = weeklyData.slice(-4).reduce((a, b) => a + b.count, 0) / 4

      // Streak calculation
      const sessionDates = new Set(allSessions.map((s: any) => s.date))
      const todayStr = format(today, 'yyyy-MM-dd')
      let currentStreak = 0
      let checkDate = new Date()
      if (!sessionDates.has(todayStr)) checkDate = subDays(checkDate, 1)
      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        if (sessionDates.has(dateStr)) { currentStreak++; checkDate = subDays(checkDate, 1) }
        else break
      }

      // Body weight trend
      const weightTrend = (bodyRes.data || []).map((w: any) => ({
        date: format(new Date(w.date + 'T00:00:00'), 'dd/MM'),
        weight: w.weight,
      }))

      setData({ totalWorkoutsMonth: monthSessions.length, mostTrainedMuscle, strongestExercise, avgWorkoutsPerWeek, streak: currentStreak, totalVolume, weeklyData, muscleDistribution, weightTrend })
    }
    load()
  }, [userId])

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Your fitness insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Workouts This Month" value={data.totalWorkoutsMonth.toString()} emoji="📅" color="bg-blue-50 text-blue-600" />
        <StatCard label="Avg / Week" value={data.avgWorkoutsPerWeek.toFixed(1)} emoji="📊" color="bg-purple-50 text-purple-600" />
        <StatCard label="Current Streak" value={`${data.streak} days 🔥`} emoji="⚡" color="bg-orange-50 text-orange-600" />
        <StatCard label="Total Volume" value={`${data.totalVolume.toLocaleString()} kg`} emoji="💪" color="bg-green-50 text-green-600" />
      </div>

      {/* Strongest Exercise */}
      {data.strongestExercise && (
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">🏆 Strongest Exercise</p>
            <p className="font-bold text-gray-900">{data.strongestExercise.name}</p>
            <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {data.strongestExercise.weight} {data.strongestExercise.unit}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Weekly Workouts Chart */}
      {data.weeklyData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Weekly Workouts</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#00BFA5" radius={[4, 4, 0, 0]} name="Workouts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Weekly Volume Chart */}
      {data.weeklyData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Weekly Volume (kg)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kg`, 'Volume']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Volume" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Muscle Distribution */}
      {data.muscleDistribution.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Muscle Group Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {data.muscleDistribution.map(({ muscle, count }) => {
              const total = data.muscleDistribution.reduce((a, b) => a + b.count, 0)
              const pct = Math.round((count / total) * 100)
              const color = MUSCLE_GROUP_COLORS[muscle as MuscleGroup] || '#6b7280'
              return (
                <div key={muscle}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{muscle}</span>
                    <span className="text-gray-500">{count} sessions ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Body Weight Trend */}
      {data.weightTrend.length > 1 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Body Weight Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip formatter={v => [`${v} KG`, 'Weight']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value, emoji, color }: { label: string; value: string; emoji: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2 text-lg`}>{emoji}</div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
      </CardContent>
    </Card>
  )
}
