'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ExerciseData {
  exercise_name: string
  history: { date: string; weight: number; unit: string }[]
  current: number
  last: number
  diff: number
  unit: string
}

const FILTERS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'All', months: 0 },
]

export default function ProgressPage() {
  const { userId } = useUser()
  const [exercises, setExercises] = useState<ExerciseData[]>([])
  const [selected, setSelected] = useState('')
  const [filter, setFilter] = useState(3)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('exercise_logs')
        .select('exercise_name, weight, unit, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      const exMap: Record<string, { date: string; weight: number; unit: string }[]> = {}
      data?.forEach((log: any) => {
        if (!exMap[log.exercise_name]) exMap[log.exercise_name] = []
        exMap[log.exercise_name].push({ date: log.created_at.split('T')[0], weight: log.weight, unit: log.unit })
      })

      const result = Object.entries(exMap).map(([name, history]) => {
        const sorted = history.sort((a, b) => a.date.localeCompare(b.date))
        const current = sorted[sorted.length - 1]?.weight || 0
        const last = sorted.length >= 2 ? sorted[sorted.length - 2]?.weight : current
        return { exercise_name: name, history: sorted, current, last, diff: parseFloat((current - last).toFixed(2)), unit: sorted[sorted.length - 1]?.unit || 'KG' }
      }).sort((a, b) => b.history.length - a.history.length)

      setExercises(result)
      if (result.length > 0) setSelected(result[0].exercise_name)
    }
    load()
  }, [userId])

  const exercise = exercises.find(e => e.exercise_name === selected)
  const filteredHistory = exercise?.history.filter(h => filter === 0 || new Date(h.date) >= subMonths(new Date(), filter)) || []
  const chartData = filteredHistory.map(h => ({ date: format(new Date(h.date + 'T00:00:00'), 'dd/MM'), weight: h.weight }))

  if (exercises.length === 0) {
    return (
      <div className="px-4 pt-6 text-center py-16">
        <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">No progress data yet</p>
        <p className="text-gray-300 text-sm">Log workouts to see your progress</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Exercise Progress</h1>
        <p className="text-sm text-gray-500">Track your strength gains</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {exercises.map(ex => (
          <button key={ex.exercise_name} onClick={() => setSelected(ex.exercise_name)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selected === ex.exercise_name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {ex.exercise_name}
          </button>
        ))}
      </div>

      {exercise && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Current</p>
              <p className="font-bold text-gray-900">{exercise.current} {exercise.unit}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Last</p>
              <p className="font-bold text-gray-900">{exercise.last} {exercise.unit}</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <div className="flex items-center justify-center gap-1">
                {exercise.diff > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : exercise.diff < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-gray-400" />}
                <span className={`font-bold text-sm ${exercise.diff > 0 ? 'text-green-600' : exercise.diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {exercise.diff > 0 ? '+' : ''}{exercise.diff}
                </span>
                <span>{exercise.diff > 0 ? '✅' : exercise.diff < 0 ? '🔻' : ''}</span>
              </div>
            </CardContent></Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 truncate flex-1">{exercise.exercise_name}</CardTitle>
                <div className="flex gap-1 ml-2">
                  {FILTERS.map(f => (
                    <button key={f.label} onClick={() => setFilter(f.months)}
                      className={`text-xs px-2 py-1 rounded-md font-medium ${filter === f.months ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip formatter={v => [`${v} ${exercise.unit}`, 'Weight']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: '#16a34a', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Not enough data for this period</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
