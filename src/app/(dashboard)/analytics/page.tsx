'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, subWeeks, subDays, subMonths } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Trophy, Zap, Flame } from 'lucide-react'

type PREntry = { name: string; weight: number; unit: string; date: string }

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
    // new
    topPRs: [] as PREntry[],
    volumeGrowth: 0, // % vs last month
    avgRestDays: 0,
    neglectedMuscles: [] as string[],
    muscleBalance: null as { push: number; pull: number; legs: number } | null,
    avgDailyCalories: 0,
    daysOverTarget: 0,
    daysUnderTarget: 0,
    topFoods: [] as { name: string; count: number }[],
    nutritionTarget: 2000,
    weeklyCalories: [] as { week: string; calories: number }[],
  })

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const today = new Date()

    async function load() {
      const [sessionsRes, logsRes, nutritionRes, profileRes] = await Promise.all([
        supabase.from('workout_sessions').select('id, date').eq('user_id', userId).order('date'),
        supabase.from('exercise_logs').select('exercise_name, muscle_group, weight, unit, sets, reps, created_at').eq('user_id', userId),
        supabase.from('nutrition_logs').select('date, food_name, calories').eq('user_id', userId).order('date'),
        supabase.from('profiles').select('target_calories').eq('id', userId).single(),
      ])

      const allSessions = sessionsRes.data || []
      const allLogs = logsRes.data || []

      // Month stats
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
      const prevMonthStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
      const prevMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
      const monthSessions = allSessions.filter((s: any) => s.date >= monthStart && s.date <= monthEnd)

      // Muscle distribution
      const muscleCount: Record<string, number> = {}
      allLogs.forEach((l: any) => {
        if (l.muscle_group) muscleCount[l.muscle_group] = (muscleCount[l.muscle_group] || 0) + 1
      })
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

      // Total volume
      const totalVolume = Math.round(allLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0))

      // Weekly data
      const weeklyData = []
      for (let i = 7; i >= 0; i--) {
        const wStart = format(startOfWeek(subWeeks(today, i)), 'yyyy-MM-dd')
        const wEnd = format(startOfWeek(subWeeks(today, i - 1)), 'yyyy-MM-dd')
        const weekSessions = allSessions.filter((s: any) => s.date >= wStart && s.date < wEnd)
        const weekLogs = allLogs.filter((l: any) => {
          const logDate = l.created_at?.split('T')[0]
          return logDate >= wStart && logDate < wEnd
        })
        const volume = Math.round(weekLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0))
        weeklyData.push({ week: `W${8 - i}`, count: weekSessions.length, volume })
      }

      const avgWorkoutsPerWeek = weeklyData.slice(-4).reduce((a, b) => a + b.count, 0) / 4

      // Streak
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

      // Body weight trend removed

      // --- NEW INSIGHTS ---

      // Top 3 PRs: highest weight per exercise with date
      const exPR: Record<string, PREntry> = {}
      allLogs.forEach((l: any) => {
        if (!exPR[l.exercise_name] || l.weight > exPR[l.exercise_name].weight)
          exPR[l.exercise_name] = { name: l.exercise_name, weight: l.weight, unit: l.unit, date: l.created_at?.split('T')[0] || '' }
      })
      const topPRs = Object.values(exPR).sort((a, b) => b.weight - a.weight).slice(0, 3)

      // Volume growth: this month vs last month
      const thisMonthLogs = allLogs.filter((l: any) => {
        const d = l.created_at?.split('T')[0] || ''
        return d >= monthStart && d <= monthEnd
      })
      const lastMonthLogs = allLogs.filter((l: any) => {
        const d = l.created_at?.split('T')[0] || ''
        return d >= prevMonthStart && d <= prevMonthEnd
      })
      const thisVol = thisMonthLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0)
      const lastVol = lastMonthLogs.reduce((a: number, l: any) => a + (l.weight * l.sets * l.reps), 0)
      const volumeGrowth = lastVol > 0 ? Math.round(((thisVol - lastVol) / lastVol) * 100) : 0

      // Avg rest days between sessions (last 30 sessions)
      const recentDates = allSessions.slice(-30).map((s: any) => s.date).sort()
      let totalGap = 0
      for (let i = 1; i < recentDates.length; i++) {
        const diff = (new Date(recentDates[i]).getTime() - new Date(recentDates[i - 1]).getTime()) / 86400000
        totalGap += diff - 1 // rest days = gap - 1
      }
      const avgRestDays = recentDates.length > 1 ? Math.round((totalGap / (recentDates.length - 1)) * 10) / 10 : 0

      // Neglected muscles: trained < 20% of avg in last 30 days
      const recentLogs = allLogs.filter((l: any) => {
        const d = l.created_at?.split('T')[0] || ''
        const cutoff = format(subDays(today, 30), 'yyyy-MM-dd')
        return d >= cutoff
      })
      const recentMuscleCount: Record<string, number> = {}
      recentLogs.forEach((l: any) => {
        if (l.muscle_group) recentMuscleCount[l.muscle_group] = (recentMuscleCount[l.muscle_group] || 0) + 1
      })
      const allMuscles: MuscleGroup[] = ['Chest', 'Back', 'Shoulder', 'Leg', 'Biceps', 'Triceps']
      const avgCount = Object.values(recentMuscleCount).reduce((a, b) => a + b, 0) / (Object.keys(recentMuscleCount).length || 1)
      const neglectedMuscles = allMuscles.filter(m => (recentMuscleCount[m] || 0) < avgCount * 0.3)

      // Push/Pull/Legs balance
      const pushMuscles = ['Chest', 'Shoulder', 'Triceps']
      const pullMuscles = ['Back', 'Biceps']
      const legMuscles = ['Leg']
      const push = pushMuscles.reduce((a, m) => a + (muscleCount[m] || 0), 0)
      const pull = pullMuscles.reduce((a, m) => a + (muscleCount[m] || 0), 0)
      const legs = legMuscles.reduce((a, m) => a + (muscleCount[m] || 0), 0)
      const muscleBalance = (push + pull + legs) > 0 ? { push, pull, legs } : null

      // NUTRITION
      const nutritionTarget = profileRes.data?.target_calories || 2000
      const allNutrition = nutritionRes.data || []
      const calByDate: Record<string, number> = {}
      allNutrition.forEach((n: any) => { calByDate[n.date] = (calByDate[n.date] || 0) + n.calories })
      const calValues = Object.values(calByDate)
      const avgDailyCalories = calValues.length > 0 ? Math.round(calValues.reduce((a, b) => a + b, 0) / calValues.length) : 0
      const daysOverTarget = calValues.filter(c => c > nutritionTarget).length
      const daysUnderTarget = calValues.filter(c => c < nutritionTarget * 0.8).length
      const foodCount: Record<string, number> = {}
      allNutrition.forEach((n: any) => { foodCount[n.food_name] = (foodCount[n.food_name] || 0) + 1 })
      const topFoods = Object.entries(foodCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))
      const weeklyCalories = []
      for (let i = 7; i >= 0; i--) {
        const wStart = format(startOfWeek(subWeeks(today, i)), 'yyyy-MM-dd')
        const wEnd = format(startOfWeek(subWeeks(today, i - 1)), 'yyyy-MM-dd')
        const wCal = allNutrition.filter((n: any) => n.date >= wStart && n.date < wEnd).reduce((a: number, n: any) => a + n.calories, 0)
        weeklyCalories.push({ week: `W${8 - i}`, calories: Math.round(wCal) })
      }

      setData({
        totalWorkoutsMonth: monthSessions.length, mostTrainedMuscle, strongestExercise,
        avgWorkoutsPerWeek, streak: currentStreak, totalVolume, weeklyData, muscleDistribution,
        topPRs, volumeGrowth, avgRestDays, neglectedMuscles, muscleBalance,
        avgDailyCalories, daysOverTarget, daysUnderTarget, topFoods, nutritionTarget, weeklyCalories,
      })
    }
    load()
  }, [userId])

  const balanceTotal = data.muscleBalance ? data.muscleBalance.push + data.muscleBalance.pull + data.muscleBalance.legs : 0

  return (
    <div className="px-4 pt-6 pb-8">
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

      {/* Volume Growth vs Last Month */}
      {data.volumeGrowth !== 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.volumeGrowth > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {data.volumeGrowth > 0
                ? <TrendingUp className="w-5 h-5 text-green-600" />
                : <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <div>
              <p className="text-xs text-gray-500">Volume vs Last Month</p>
              <p className={`font-bold text-sm ${data.volumeGrowth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {data.volumeGrowth > 0 ? '+' : ''}{data.volumeGrowth}%
                <span className="text-gray-500 font-normal ml-1">
                  {data.volumeGrowth > 10 ? '— great progress! 🚀' : data.volumeGrowth > 0 ? '— keep it up!' : '— try to increase load'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avg Rest Days */}
      {data.avgRestDays > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <Minus className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Rest Between Sessions</p>
              <p className="font-bold text-sm text-gray-900">
                {data.avgRestDays} days
                <span className="text-gray-500 font-normal ml-1">
                  {data.avgRestDays <= 1 ? '— high frequency 💪' : data.avgRestDays <= 2 ? '— good recovery balance' : '— consider training more often'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neglected Muscles Warning */}
      {data.neglectedMuscles.length > 0 && (
        <Card className="border-0 shadow-sm mb-4 border-l-4 border-l-amber-400">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Neglected in last 30 days</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {data.neglectedMuscles.join(', ')} — consider adding these to your next sessions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top PRs */}
      {data.topPRs.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-500" /> Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {data.topPRs.map((pr, i) => (
              <div key={pr.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pr.name}</p>
                    {pr.date && <p className="text-xs text-gray-400">{format(new Date(pr.date + 'T00:00:00'), 'dd MMM yyyy')}</p>}
                  </div>
                </div>
                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  {pr.weight} {pr.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Push / Pull / Legs Balance */}
      {data.muscleBalance && balanceTotal > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-500" /> Push / Pull / Legs Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {[
              { label: 'Push (Chest, Shoulder, Triceps)', value: data.muscleBalance.push, color: '#ef4444' },
              { label: 'Pull (Back, Biceps)', value: data.muscleBalance.pull, color: '#3b82f6' },
              { label: 'Legs', value: data.muscleBalance.legs, color: '#00BFA5' },
            ].map(({ label, value, color }) => {
              const pct = Math.round((value / balanceTotal) * 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-700">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
            {data.muscleBalance.legs / balanceTotal < 0.2 && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Leg training is low — don't skip leg day!</p>
            )}
            {data.muscleBalance.pull / balanceTotal < 0.25 && (
              <p className="text-xs text-amber-600 mt-1">⚠️ Pull volume is low — balance with more back/biceps work</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strongest Exercise */}
      {data.strongestExercise && (
        <Card className="border-0 shadow-sm mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">🏆 Heaviest Lift Ever</p>
            <p className="font-bold text-gray-900">{data.strongestExercise.name}</p>
            <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {data.strongestExercise.weight} {data.strongestExercise.unit}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Weekly Workouts + Volume (combined) */}
      {data.weeklyData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Weekly Workouts & Volume</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, name) => name === 'Volume' ? [`${Number(v).toLocaleString()} kg`, name] : [v, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="count" fill="#00BFA5" radius={[4, 4, 0, 0]} name="Workouts" />
                <Bar yAxisId="right" dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Volume" />
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
                    <span className="text-gray-500">{count} sets ({pct}%)</span>
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

      {/* Nutrition Analytics */}
      {data.avgDailyCalories > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3 mt-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-semibold text-gray-700">Nutrition Insights</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-orange-500">{data.avgDailyCalories}</p>
                <p className="text-xs text-gray-500">Avg kcal/day</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-red-500">{data.daysOverTarget}</p>
                <p className="text-xs text-gray-500">Days over</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-blue-500">{data.daysUnderTarget}</p>
                <p className="text-xs text-gray-500">Days under</p>
              </CardContent>
            </Card>
          </div>

          {data.weeklyCalories.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">Weekly Calories</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kcal`, 'Calories']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="calories" fill="#f97316" radius={[4, 4, 0, 0]} name="Calories" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
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
