'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { format, subMonths, subYears } from 'date-fns'

interface ProgressEntry {
  date: string
  weight: number
  unit: string
}

interface ExerciseProgressData {
  exercise_name: string
  history: ProgressEntry[]
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

export default function ProgressCharts({ exercises }: { exercises: ExerciseProgressData[] }) {
  const [filter, setFilter] = useState(3)
  const [selected, setSelected] = useState(exercises[0]?.exercise_name || '')

  const exercise = exercises.find(e => e.exercise_name === selected)

  const filteredHistory = exercise?.history.filter(h => {
    if (filter === 0) return true
    const cutoff = subMonths(new Date(), filter)
    return new Date(h.date) >= cutoff
  }) || []

  const chartData = filteredHistory.map(h => ({
    date: format(new Date(h.date + 'T00:00:00'), 'dd/MM'),
    weight: h.weight,
  }))

  return (
    <div className="space-y-4">
      {/* Exercise Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {exercises.map(ex => (
          <button
            key={ex.exercise_name}
            onClick={() => setSelected(ex.exercise_name)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              selected === ex.exercise_name
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {ex.exercise_name}
          </button>
        ))}
      </div>

      {exercise && (
        <>
          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Current</p>
                <p className="font-bold text-gray-900">{exercise.current} {exercise.unit}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Last</p>
                <p className="font-bold text-gray-900">{exercise.last} {exercise.unit}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Progress</p>
                <div className="flex items-center justify-center gap-1">
                  {exercise.diff > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : exercise.diff < 0 ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : (
                    <Minus className="w-3 h-3 text-gray-400" />
                  )}
                  <span className={`font-bold text-sm ${
                    exercise.diff > 0 ? 'text-green-600' : exercise.diff < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {exercise.diff > 0 ? '+' : ''}{exercise.diff} {exercise.unit}
                  </span>
                  <span>{exercise.diff > 0 ? '✅' : exercise.diff < 0 ? '🔻' : ''}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 truncate flex-1">
                  {exercise.exercise_name}
                </CardTitle>
                <div className="flex gap-1 ml-2">
                  {FILTERS.map(f => (
                    <button
                      key={f.label}
                      onClick={() => setFilter(f.months)}
                      className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                        filter === f.months
                          ? 'bg-primary text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
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
                    <Tooltip
                      formatter={(v) => [`${v} ${exercise.unit}`, 'Weight']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#16a34a"
                      strokeWidth={2.5}
                      dot={{ fill: '#16a34a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                  Not enough data for this period
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
