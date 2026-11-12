export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import ProgressCharts from '@/components/progress/ProgressCharts'
import { TrendingUp } from 'lucide-react'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: logs } = await supabase
    .from('exercise_logs')
    .select('exercise_name, weight, unit, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  // Group by exercise
  const exerciseMap: Record<string, { date: string; weight: number; unit: string }[]> = {}
  logs?.forEach(log => {
    if (!exerciseMap[log.exercise_name]) exerciseMap[log.exercise_name] = []
    exerciseMap[log.exercise_name].push({
      date: log.created_at.split('T')[0],
      weight: log.weight,
      unit: log.unit,
    })
  })

  const exercises = Object.entries(exerciseMap).map(([name, history]) => {
    const sorted = history.sort((a, b) => a.date.localeCompare(b.date))
    const current = sorted[sorted.length - 1]?.weight || 0
    const last = sorted.length >= 2 ? sorted[sorted.length - 2]?.weight : current
    return {
      exercise_name: name,
      history: sorted,
      current,
      last,
      diff: parseFloat((current - last).toFixed(2)),
      unit: sorted[sorted.length - 1]?.unit || 'KG',
    }
  }).sort((a, b) => b.history.length - a.history.length)

  return (
    <div className="px-4 pt-6">
      <PageHeader title="Exercise Progress" subtitle="Track your strength gains" />
      {exercises.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No progress data yet</p>
          <p className="text-gray-300 text-sm">Log workouts to see your progress</p>
        </div>
      ) : (
        <ProgressCharts exercises={exercises} />
      )}
    </div>
  )
}
