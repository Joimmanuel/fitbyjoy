'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Dumbbell, ChevronRight } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISE_RECOMMENDATIONS, MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup, WeightUnit } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { format } from 'date-fns'

interface ExerciseEntry {
  exercise_name: string
  muscle_group: MuscleGroup | ''
  weight: string
  unit: WeightUnit
  sets: string
  reps: string
}

const emptyEntry = (): ExerciseEntry => ({ exercise_name: '', muscle_group: '', weight: '', unit: 'KG', sets: '', reps: '' })

export default function WorkoutPage() {
  const { userId } = useUser()
  const supabase = createClient()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyEntry()])
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    loadSessions()
  }, [userId])

  async function loadSessions() {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)
    setSessions(data || [])
  }

  function updateExercise(idx: number, field: keyof ExerciseEntry, value: string) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function fillRecommendation(idx: number, name: string, mg: MuscleGroup) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, exercise_name: name, muscle_group: mg } : e))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    const valid = exercises.filter(ex => ex.exercise_name && ex.weight && ex.sets && ex.reps)
    if (valid.length === 0) return toast.error('Add at least one exercise')
    setLoading(true)

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({ user_id: userId, date })
      .select().single()

    if (error || !session) { toast.error('Failed to save'); setLoading(false); return }

    await supabase.from('exercise_logs').insert(
      valid.map(ex => ({
        session_id: session.id,
        user_id: userId,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group || null,
        weight: parseFloat(ex.weight),
        unit: ex.unit,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps),
      }))
    )

    toast.success('Workout saved! 💪')
    setExercises([emptyEntry()])
    setDate(format(new Date(), 'yyyy-MM-dd'))
    loadSessions()
    setLoading(false)
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Workout Log</h1>
        <p className="text-sm text-gray-500">Track your exercises & muscle groups</p>
      </div>
      <Tabs defaultValue="log">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="log" className="flex-1">Log Workout</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Exercises</p>
                <Badge variant="secondary">{exercises.length}</Badge>
              </div>
              {exercises.map((ex, idx) => {
                const mgColor = ex.muscle_group ? MUSCLE_GROUP_COLORS[ex.muscle_group as MuscleGroup] : undefined
                const recs = ex.muscle_group ? EXERCISE_RECOMMENDATIONS[ex.muscle_group as MuscleGroup] : []
                return (
                <Card key={idx} className="border-0 shadow-sm overflow-hidden">
                  {mgColor && <div className="h-1" style={{ backgroundColor: mgColor }} />}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: mgColor || '#6b7280' }}>
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Exercise {idx + 1}</span>
                      </div>
                      {exercises.length > 1 && (
                        <button type="button" onClick={() => setExercises(p => p.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Muscle Group</Label>
                      <Select value={ex.muscle_group} onValueChange={v => updateExercise(idx, 'muscle_group', v)}>
                        <SelectTrigger><SelectValue placeholder="Select muscle group" /></SelectTrigger>
                        <SelectContent>
                          {MUSCLE_GROUPS.map(mg => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {recs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {recs.map(rec => (
                          <button key={rec} type="button" onClick={() => fillRecommendation(idx, rec, ex.muscle_group as MuscleGroup)}
                            className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 font-medium">
                            {rec}<ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Exercise Name</Label>
                      <Input placeholder="e.g. Seated Tricep Extension" value={ex.exercise_name}
                        onChange={e => updateExercise(idx, 'exercise_name', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Weight</Label>
                        <Input type="number" placeholder="20" value={ex.weight} min="0" step="0.5"
                          onChange={e => updateExercise(idx, 'weight', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Unit</Label>
                        <Select value={ex.unit} onValueChange={v => updateExercise(idx, 'unit', v ?? 'KG')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="LBS">LBS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Sets</Label>
                        <Input type="number" placeholder="4" value={ex.sets} min="1"
                          onChange={e => updateExercise(idx, 'sets', e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Reps</Label>
                        <Input type="number" placeholder="12" value={ex.reps} min="1"
                          onChange={e => updateExercise(idx, 'reps', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
              <Button type="button" variant="outline" className="w-full border-dashed"
                onClick={() => setExercises(p => [...p, emptyEntry()])}>
                <Plus className="w-4 h-4 mr-2" />Add Exercise
              </Button>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Dumbbell className="w-5 h-5 mr-2" />}
              Save Workout
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="history">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No workout history yet</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {sessions.map((session: any) => {
                const logs: any[] = session.exercise_logs || []
                const uniqueMGs = [...new Set(logs.map((e: any) => e.muscle_group).filter(Boolean))] as MuscleGroup[]
                return (
                  <Card key={session.id} className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 flex">
                      {uniqueMGs.length > 0
                        ? uniqueMGs.map(mg => (
                            <div key={mg} className="flex-1" style={{ backgroundColor: MUSCLE_GROUP_COLORS[mg] }} />
                          ))
                        : <div className="flex-1 bg-gray-200" />}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(session.date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {uniqueMGs.map(mg => {
                              const c = MUSCLE_GROUP_COLORS[mg]
                              return (
                                <Badge key={mg} variant="secondary" className="text-xs"
                                  style={{ backgroundColor: `${c}20`, color: c }}>{mg}</Badge>
                              )
                            })}
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{logs.length} exercises</span>
                      </div>
                      {logs.map((ex: any) => {
                        const c = ex.muscle_group ? MUSCLE_GROUP_COLORS[ex.muscle_group as MuscleGroup] : '#6b7280'
                        return (
                          <div key={ex.id} className="flex justify-between text-sm py-1 border-b last:border-0 items-center">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {ex.muscle_group && (
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c }} />
                              )}
                              <span className="text-gray-700 truncate">{ex.exercise_name}</span>
                            </div>
                            <span className="text-gray-500 ml-2 shrink-0 text-xs">{ex.weight}{ex.unit} · {ex.sets}×{ex.reps}</span>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
