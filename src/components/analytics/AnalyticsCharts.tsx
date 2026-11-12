'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup } from '@/types'

interface AnalyticsData {
  totalWorkoutsMonth: number
  mostTrainedMuscle: string
  strongestExercise: { name: string; weight: number; unit: string } | null
  avgWorkoutsPerWeek: number
  weeklyData: { week: string; count: number }[]
  muscleDistribution: { muscle: string; count: number }[]
  weightTrend: { date: string; weight: number }[]
}

export default function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Workouts This Month" value={data.totalWorkoutsMonth.toString()} emoji="📅" color="bg-blue-50 text-blue-600" />
        <StatCard label="Avg / Week" value={data.avgWorkoutsPerWeek.toFixed(1)} emoji="📊" color="bg-purple-50 text-purple-600" />
        <StatCard label="Most Trained" value={data.mostTrainedMuscle || '-'} emoji="💪" color="bg-green-50 text-green-600" />
        <StatCard
          label="Strongest"
          value={data.strongestExercise ? `${data.strongestExercise.weight}${data.strongestExercise.unit}` : '-'}
          emoji="🏆"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {data.strongestExercise && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">🏆 Strongest Exercise</p>
            <p className="font-bold text-gray-900">{data.strongestExercise.name}</p>
            <Badge className="mt-1 bg-orange-100 text-orange-700 border-0">
              {data.strongestExercise.weight} {data.strongestExercise.unit}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Weekly Workouts Chart */}
      {data.weeklyData.length > 0 && (
        <Card className="border-0 shadow-sm">
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
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="Workouts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Muscle Distribution */}
      {data.muscleDistribution.length > 0 && (
        <Card className="border-0 shadow-sm">
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
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Body Weight Trend */}
      {data.weightTrend.length > 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Body Weight Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(v) => [`${v} KG`, 'Weight']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
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
        <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2 text-lg`}>
          {emoji}
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
      </CardContent>
    </Card>
  )
}
