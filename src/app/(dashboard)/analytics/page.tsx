import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
import { format, startOfMonth, endOfMonth, startOfWeek, subWeeks } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')

  const [sessionsRes, exerciseLogsRes, bodyWeightRes] = await Promise.all([
    supabase.from('workout_sessions')
      .select('id, date, muscle_group')
      .eq('user_id', user!.id)
      .order('date', { ascending: true }),
    supabase.from('exercise_logs')
      .select('exercise_name, weight, unit')
      .eq('user_id', user!.id),
    supabase.from('body_weight_logs')
      .select('date, weight')
      .eq('user_id', user!.id)
      .order('date', { ascending: true })
      .limit(30),
  ])

  const allSessions = sessionsRes.data || []
  const monthSessions = allSessions.filter(s => s.date >= monthStart && s.date <= monthEnd)

  // Most trained muscle
  const muscleCount: Record<string, number> = {}
  allSessions.forEach(s => {
    muscleCount[s.muscle_group] = (muscleCount[s.muscle_group] || 0) + 1
  })
  const mostTrainedMuscle = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  // Muscle distribution
  const muscleDistribution = Object.entries(muscleCount)
    .map(([muscle, count]) => ({ muscle, count }))
    .sort((a, b) => b.count - a.count)

  // Strongest exercise
  const exerciseWeights: Record<string, { weight: number; unit: string }> = {}
  exerciseLogsRes.data?.forEach(log => {
    if (!exerciseWeights[log.exercise_name] || log.weight > exerciseWeights[log.exercise_name].weight) {
      exerciseWeights[log.exercise_name] = { weight: log.weight, unit: log.unit }
    }
  })
  const strongest = Object.entries(exerciseWeights).sort((a, b) => b[1].weight - a[1].weight)[0]
  const strongestExercise = strongest ? { name: strongest[0], ...strongest[1] } : null

  // Avg workouts per week (last 4 weeks)
  const weekCounts: number[] = []
  for (let i = 0; i < 4; i++) {
    const weekStart = format(startOfWeek(subWeeks(today, i)), 'yyyy-MM-dd')
    const weekEnd = format(startOfWeek(subWeeks(today, i - 1)), 'yyyy-MM-dd')
    weekCounts.push(allSessions.filter(s => s.date >= weekStart && s.date < weekEnd).length)
  }
  const avgWorkoutsPerWeek = weekCounts.reduce((a, b) => a + b, 0) / 4

  // Weekly data for chart (last 8 weeks)
  const weeklyData = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = format(startOfWeek(subWeeks(today, i)), 'yyyy-MM-dd')
    const weekEnd = format(startOfWeek(subWeeks(today, i - 1)), 'yyyy-MM-dd')
    const count = allSessions.filter(s => s.date >= weekStart && s.date < weekEnd).length
    weeklyData.push({ week: `W${8 - i}`, count })
  }

  // Body weight trend
  const weightTrend = (bodyWeightRes.data || []).map(w => ({
    date: format(new Date(w.date + 'T00:00:00'), 'dd/MM'),
    weight: w.weight,
  }))

  return (
    <div className="px-4 pt-6">
      <PageHeader title="Analytics" subtitle="Your fitness insights" />
      <AnalyticsCharts
        data={{
          totalWorkoutsMonth: monthSessions.length,
          mostTrainedMuscle,
          strongestExercise,
          avgWorkoutsPerWeek,
          weeklyData,
          muscleDistribution,
          weightTrend,
        }}
      />
    </div>
  )
}
