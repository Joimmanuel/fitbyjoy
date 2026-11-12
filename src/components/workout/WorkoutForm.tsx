'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Dumbbell, ChevronRight } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISE_RECOMMENDATIONS } from '@/lib/constants'
import { MuscleGroup, WeightUnit } from '@/types'
import { format } from 'date-fns'

interface ExerciseEntry {
  exercise_name: string
  weight: string
  unit: WeightUnit
  sets: string
  reps: string
}

const emptyEntry = (): ExerciseEntry => ({
  exercise_name: '',
  weight: '',
  unit: 'KG',
  sets: '',
  reps: '',
})

export default function WorkoutForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | ''>('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyEntry()])

  const recommendations = muscleGroup ? EXERCISE_RECOMMENDATIONS[muscleGroup as MuscleGroup] : []

  function updateExercise(idx: number, field: keyof ExerciseEntry, value: string) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function addExercise() {
    setExercises(prev => [...prev, emptyEntry()])
  }

  function removeExercise(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function fillRecommendation(recName: string) {
    const lastEmpty = exercises.findIndex(e => !e.exercise_name)
    if (lastEmpty >= 0) {
      updateExercise(lastEmpty, 'exercise_name', recName)
    } else {
      setExercises(prev => [...prev, { ...emptyEntry(), exercise_name: recName }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!muscleGroup) return toast.error('Please select a muscle group')
    const valid = exercises.filter(ex => ex.exercise_name && ex.weight && ex.sets && ex.reps)
    if (valid.length === 0) return toast.error('Add at least one exercise')

    setLoading(true)
    const { data: session, error: sessionErr } = await supabase
      .from('workout_sessions')
      .insert({ user_id: userId, date, muscle_group: muscleGroup })
      .select()
      .single()

    if (sessionErr || !session) {
      toast.error('Failed to save workout')
      setLoading(false)
      return
    }

    const logs = valid.map(ex => ({
      session_id: session.id,
      user_id: userId,
      exercise_name: ex.exercise_name,
      weight: parseFloat(ex.weight),
      unit: ex.unit,
      sets: parseInt(ex.sets),
      reps: parseInt(ex.reps),
    }))

    const { error: logsErr } = await supabase.from('exercise_logs').insert(logs)
    if (logsErr) {
      toast.error('Failed to save exercises')
    } else {
      toast.success('Workout saved! 💪')
      setMuscleGroup('')
      setExercises([emptyEntry()])
      setDate(format(new Date(), 'yyyy-MM-dd'))
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Muscle Group */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Muscle Group</Label>
            <Select value={muscleGroup} onValueChange={v => setMuscleGroup(v as MuscleGroup)}>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {MUSCLE_GROUPS.map(mg => (
                  <SelectItem key={mg} value={mg}>{mg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            💡 Recommended Exercises
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec: string) => (
              <button
                key={rec}
                type="button"
                onClick={() => fillRecommendation(rec)}
                className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 font-medium active:bg-green-100 transition-colors"
              >
                {rec}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Entries */}
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
                  <button type="button" onClick={() => removeExercise(idx)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Exercise Name</Label>
                <Input
                  placeholder="e.g. Seated Tricep Extension"
                  value={ex.exercise_name}
                  onChange={e => updateExercise(idx, 'exercise_name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Weight</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={ex.weight}
                    onChange={e => updateExercise(idx, 'weight', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Unit</Label>
                  <Select value={ex.unit} onValueChange={v => updateExercise(idx, 'unit', v ?? 'KG')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    type="number"
                    placeholder="4"
                    value={ex.sets}
                    onChange={e => updateExercise(idx, 'sets', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={ex.reps}
                    onChange={e => updateExercise(idx, 'reps', e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full border-dashed" onClick={addExercise}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Dumbbell className="w-5 h-5 mr-2" />}
        Save Workout
      </Button>
    </form>
  )
}
