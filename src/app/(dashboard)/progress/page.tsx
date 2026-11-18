'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus, Search, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { MUSCLE_GROUPS, MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup } from '@/types'

interface ExerciseData {
  exercise_name: string
  muscle_group: string
  history: { date: string; weight: number; unit: string }[]
  current: number
  pr: number
  first: number
  totalSessions: number
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
  const [search, setSearch] = useState('')
  const [expandedMG, setExpandedMG] = useState<string | null>(null)
  const [bodyLogs, setBodyLogs] = useState<{ date: string; weight: number }[]>([])
  const [bodyFilter, setBodyFilter] = useState(3)
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    async function load() {
      const [logsRes, bodyRes] = await Promise.all([
        supabase.from('exercise_logs').select('exercise_name, muscle_group, weight, unit, created_at').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('body_weight_logs').select('date, weight').eq('user_id', userId).order('date', { ascending: true }),
      ])

      const exMap: Record<string, { date: string; weight: number; unit: string; muscle_group: string }[]> = {}
      logsRes.data?.forEach((log: any) => {
        if (!exMap[log.exercise_name]) exMap[log.exercise_name] = []
        exMap[log.exercise_name].push({ date: log.created_at.split('T')[0], weight: log.weight, unit: log.unit, muscle_group: log.muscle_group || '' })
      })

      const result = Object.entries(exMap).map(([name, history]) => {
        const sorted = history.sort((a, b) => a.date.localeCompare(b.date))
        const weights = sorted.map(h => h.weight)
        const current = sorted[sorted.length - 1]?.weight || 0
        const last = sorted.length >= 2 ? sorted[sorted.length - 2]?.weight : current
        const pr = Math.max(...weights)
        const first = sorted[0]?.weight || 0
        return {
          exercise_name: name,
          muscle_group: sorted[sorted.length - 1]?.muscle_group || '',
          history: sorted,
          current, pr, first,
          totalSessions: sorted.length,
          diff: parseFloat((current - last).toFixed(2)),
          unit: sorted[sorted.length - 1]?.unit || 'KG',
        }
      }).sort((a, b) => b.totalSessions - a.totalSessions)

      setExercises(result)
      if (result.length > 0) {
        setSelected(result[0].exercise_name)
        setExpandedMG(result[0].muscle_group || MUSCLE_GROUPS[0])
      }

      setBodyLogs((bodyRes.data || []).map((b: any) => ({ date: b.date, weight: b.weight })))
    }
    load()
  }, [userId])

  async function addBodyWeight() {
    if (!newWeight || !userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('body_weight_logs').upsert({ user_id: userId, date: newDate, weight: parseFloat(newWeight) }, { onConflict: 'user_id,date' }).select().single()
    if (!error && data) {
      setBodyLogs(prev => {
        const filtered = prev.filter(b => b.date !== newDate)
        return [...filtered, { date: data.date, weight: data.weight }].sort((a, b) => a.date.localeCompare(b.date))
      })
      setNewWeight('')
    }
  }

  const exercise = exercises.find(e => e.exercise_name === selected)
  const filteredHistory = exercise?.history.filter(h => filter === 0 || new Date(h.date) >= subMonths(new Date(), filter)) || []
  const chartData = filteredHistory.map(h => ({ date: format(new Date(h.date + 'T00:00:00'), 'dd/MM'), weight: h.weight }))

  const filteredBodyLogs = bodyLogs.filter(b => bodyFilter === 0 || new Date(b.date) >= subMonths(new Date(), bodyFilter))
  const bodyChartData = filteredBodyLogs.map(b => ({ date: format(new Date(b.date + 'T00:00:00'), 'dd/MM'), weight: b.weight }))
  const latestBody = bodyLogs[bodyLogs.length - 1]
  const prevBody = bodyLogs[bodyLogs.length - 2]
  const bodyDiff = latestBody && prevBody ? parseFloat((latestBody.weight - prevBody.weight).toFixed(1)) : 0

  // Group exercises by muscle group, filtered by search
  const grouped = MUSCLE_GROUPS.reduce((acc, mg) => {
    const list = exercises.filter(e => e.muscle_group === mg && e.exercise_name.toLowerCase().includes(search.toLowerCase()))
    if (list.length > 0) acc[mg] = list
    return acc
  }, {} as Record<string, ExerciseData[]>)
  // Ungrouped (no muscle group)
  const ungrouped = exercises.filter(e => !e.muscle_group && e.exercise_name.toLowerCase().includes(search.toLowerCase()))

  if (exercises.length === 0 && bodyLogs.length === 0) {
    return (
      <div className="px-4 pt-6 text-center py-16">
        <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">No progress data yet</p>
        <p className="text-gray-300 text-sm">Log workouts to see your progress</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Progress</h1>
        <p className="text-sm text-gray-500">Track your strength & body gains</p>
      </div>

      <Tabs defaultValue="strength">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="strength" className="flex-1">Strength</TabsTrigger>
          <TabsTrigger value="body" className="flex-1">Body Weight</TabsTrigger>
        </TabsList>

        {/* STRENGTH TAB */}
        <TabsContent value="strength">
          <div className="flex gap-3">
            {/* Left: Exercise Selector */}
            <div className="w-36 shrink-0 space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input className="pl-7 h-8 text-xs" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {Object.entries(grouped).map(([mg, list]) => {
                  const color = MUSCLE_GROUP_COLORS[mg as MuscleGroup]
                  const isOpen = expandedMG === mg || search.length > 0
                  return (
                    <div key={mg}>
                      <button
                        onClick={() => setExpandedMG(isOpen && !search ? null : mg)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: `${color}20`, color }}>
                        <span>{mg}</span>
                        {search.length === 0 && (isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                      {isOpen && list.map(ex => (
                        <button key={ex.exercise_name}
                          onClick={() => setSelected(ex.exercise_name)}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded-lg mt-0.5 leading-tight transition-colors ${selected === ex.exercise_name ? 'bg-gray-800 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                          {ex.exercise_name}
                        </button>
                      ))}
                    </div>
                  )
                })}
                {ungrouped.map(ex => (
                  <button key={ex.exercise_name}
                    onClick={() => setSelected(ex.exercise_name)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg leading-tight transition-colors ${selected === ex.exercise_name ? 'bg-gray-800 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {ex.exercise_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Chart + Stats */}
            <div className="flex-1 min-w-0 space-y-3">
              {exercise && (
                <>
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-3">
                        <p className="text-xs text-gray-400">Current</p>
                        <p className="font-bold text-gray-900 text-sm">{exercise.current} {exercise.unit}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {exercise.diff > 0 ? <TrendingUp className="w-3 h-3 text-[#00BFA5]" /> : exercise.diff < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-gray-400" />}
                          <span className={`text-xs font-semibold ${exercise.diff > 0 ? 'text-[#00BFA5]' : exercise.diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {exercise.diff > 0 ? '+' : ''}{exercise.diff}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-3">
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> PR</p>
                        <p className="font-bold text-orange-500 text-sm">{exercise.pr} {exercise.unit}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{exercise.totalSessions} sessions</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Chart */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-1 pt-3 px-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-gray-600 truncate flex-1">{exercise.exercise_name}</CardTitle>
                        <div className="flex gap-0.5 ml-1">
                          {FILTERS.map(f => (
                            <button key={f.label} onClick={() => setFilter(f.months)}
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${filter === f.months ? 'bg-[#00BFA5] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-1 pb-3">
                      {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} width={30} />
                            <Tooltip formatter={v => [`${v} ${exercise.unit}`, 'Weight']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <ReferenceLine y={exercise.pr} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'PR', fontSize: 9, fill: '#f59e0b' }} />
                            <Line type="monotone" dataKey="weight" stroke="#00BFA5" strokeWidth={2.5} dot={{ fill: '#00BFA5', r: 3 }} activeDot={{ r: 5 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[180px] flex items-center justify-center text-gray-400 text-xs">Not enough data</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* History list */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-1 pt-3 px-3">
                      <CardTitle className="text-xs font-semibold text-gray-600">History</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {[...filteredHistory].reverse().map((h, i) => (
                          <div key={i} className="flex justify-between items-center text-xs py-1 border-b last:border-0">
                            <span className="text-gray-500">{format(new Date(h.date + 'T00:00:00'), 'dd MMM yyyy')}</span>
                            <div className="flex items-center gap-1">
                              {h.weight === exercise.pr && <Trophy className="w-3 h-3 text-yellow-500" />}
                              <span className={`font-semibold ${h.weight === exercise.pr ? 'text-orange-500' : 'text-gray-800'}`}>{h.weight} {h.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* BODY WEIGHT TAB */}
        <TabsContent value="body">
          {/* Quick log */}
          <Card className="border-0 shadow-sm mb-4">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Log Body Weight</p>
              <div className="flex gap-2">
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="flex-1" />
                <Input type="number" placeholder="kg" step="0.1" min="0" value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-24" />
                <button onClick={addBodyWeight} disabled={!newWeight}
                  className="px-4 py-2 bg-[#00BFA5] text-white text-sm font-semibold rounded-lg disabled:opacity-40">
                  Save
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {latestBody && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                <p className="text-xs text-gray-400">Current</p>
                <p className="font-bold text-gray-900">{latestBody.weight} kg</p>
              </CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                <p className="text-xs text-gray-400">Change</p>
                <div className="flex items-center justify-center gap-1">
                  {bodyDiff < 0 ? <TrendingDown className="w-3 h-3 text-[#00BFA5]" /> : bodyDiff > 0 ? <TrendingUp className="w-3 h-3 text-orange-500" /> : <Minus className="w-3 h-3 text-gray-400" />}
                  <span className={`font-bold text-sm ${bodyDiff < 0 ? 'text-[#00BFA5]' : bodyDiff > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {bodyDiff > 0 ? '+' : ''}{bodyDiff}
                  </span>
                </div>
              </CardContent></Card>
              <Card className="border-0 shadow-sm"><CardContent className="p-3 text-center">
                <p className="text-xs text-gray-400">Lowest</p>
                <p className="font-bold text-[#00BFA5]">{Math.min(...bodyLogs.map(b => b.weight))} kg</p>
              </CardContent></Card>
            </div>
          )}

          {/* Chart */}
          {bodyChartData.length > 1 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-1 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700">Weight Trend</CardTitle>
                  <div className="flex gap-0.5">
                    {FILTERS.map(f => (
                      <button key={f.label} onClick={() => setBodyFilter(f.months)}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${bodyFilter === f.months ? 'bg-[#00BFA5] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={bodyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip formatter={v => [`${v} kg`, 'Weight']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Body weight history list */}
          {bodyLogs.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">History</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {[...bodyLogs].reverse().map((b, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                      <span className="text-gray-500 text-xs">{format(new Date(b.date + 'T00:00:00'), 'dd MMM yyyy')}</span>
                      <span className="font-semibold text-gray-800">{b.weight} kg</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
