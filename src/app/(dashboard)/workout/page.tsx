'use client'

import { useState } from 'react'
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
import { MuscleGroup, WeightUnit, WorkoutSession, ExerciseLog } from '@/types'
import { saveWorkout, getWorkouts, generateId } from '@/lib/storage'
import { format } from 'date-fns'

interface ExerciseEntry {
  exercise_name: string
  weight: string
  unit: WeightUnit
  sets: string
  reps: string
}

const emptyEntry = (): ExerciseEntry => ({ exercise_name: '', weight: '', unit: 'KG', sets: '', reps: '' })

export default function WorkoutPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyEntry()])
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => getWorkouts())

  const recommendations = muscleGroup ? EXERCISE_RECOMMENDATIONS[muscleGroup as MuscleGroup] : []

  function updateExercise(idx: number, field: keyof ExerciseEntry, value: string) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function fillRecommendation(name: string) {
    const lastEmpty = exercises.findIndex(e => !e.exercise_name)
    if (lastEmpty >= 0) updateExercise(lastEmpty, 'exercise_name', name)
    else setExercises(prev => [...prev, { ...emptyEntry(), exercise_name: name }])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!muscleGroup) return toast.error('Please select a muscle group')
    const valid = exercises.filter(ex => ex.exercise_name && ex.weight && ex.sets && ex.reps)
    if (valid.length === 0) return toast.error('Add at least one exercise')
    setLoading(true)
    const session: WorkoutSession = {
      id: generateId(),
      date,
      muscle_group: muscleGroup as MuscleGroup,
      exercises: valid.map(ex => ({
        id: generateId(),
        exercise_name: ex.exercise_name,
        weight: parseFloat(ex.weight),
        unit: ex.unit,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps),
      } as ExerciseLog)),
    }
    saveWorkout(session)
    setSessions(getWorkouts())
    toast.success('Workout saved! 💪')
    setMuscleGroup('')
    setExercises([emptyEntry()])
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setLoading(false)
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Workout Log</h1>
        <p className="text-sm text-gray-500">Track your training sessions</p>
      </div>
      <Tabs defaultValue="log">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="log" className="flex-1">Log Workout</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Muscle Group</Label>
                  <Select value={muscleGroup} onValueChange={v => setMuscleGroup(v as MuscleGroup)}>
                    <SelectTrigger><SelectValue placeholder="Select muscle group" /></SelectTrigger>
                    <SelectContent>
                      {MUSCLE_GROUPS.map(mg => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {recommendations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">💡 Recommended</p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map(rec => (
                    <button key={rec} type="button" onClick={() => fillRecommendation(rec)}
                      className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 font-medium">
                      {rec}<ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Exercises</p>
                <Badge variant="secondary">{exercises.length}</Badge>
              </div>
              {exercises.map((ex, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
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
              ))}
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
              {sessions.map(session => {
                const color = MUSCLE_GROUP_COLORS[session.muscle_group] || '#6b7280'
                return (
                  <Card key={session.id} className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1" style={{ backgroundColor: color }} />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(session.date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1"
                            style={{ backgroundColor: `${color}20`, color }}>{session.muscle_group}</Badge>
                        </div>
                        <span className="text-sm text-gray-400">{session.exercises.length} exercises</span>
                      </div>
                      {session.exercises.map(ex => (
                        <div key={ex.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                          <span className="text-gray-700 truncate flex-1">{ex.exercise_name}</span>
                          <span className="text-gray-500 ml-2 shrink-0 text-xs">{ex.weight}{ex.unit} · {ex.sets}×{ex.reps}</span>
                        </div>
                      ))}
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
