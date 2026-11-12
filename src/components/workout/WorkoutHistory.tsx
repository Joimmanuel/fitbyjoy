'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Dumbbell } from 'lucide-react'
import { MUSCLE_GROUP_COLORS } from '@/lib/constants'
import { MuscleGroup } from '@/types'

interface ExerciseLog {
  id: string
  exercise_name: string
  weight: number
  unit: string
  sets: number
  reps: number
}

interface Session {
  id: string
  date: string
  muscle_group: MuscleGroup
  exercise_logs: ExerciseLog[]
}

export default function WorkoutHistory({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400">No workout history yet</p>
        <p className="text-gray-300 text-sm">Start logging your workouts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-4">
      {sessions.map(session => {
        const color = MUSCLE_GROUP_COLORS[session.muscle_group] || '#6b7280'
        return (
          <Card key={session.id} className="border-0 shadow-sm overflow-hidden">
            <div className="h-1" style={{ backgroundColor: color }} />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(session.date + 'T00:00:00'), 'dd MMM yyyy')}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs mt-1"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {session.muscle_group}
                  </Badge>
                </div>
                <span className="text-sm text-gray-400">{session.exercise_logs?.length || 0} exercises</span>
              </div>
              <div className="space-y-1.5">
                {session.exercise_logs?.map(log => (
                  <div key={log.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate flex-1">{log.exercise_name}</span>
                    <span className="text-gray-500 ml-2 shrink-0 text-xs">
                      {log.weight}{log.unit} · {log.sets}×{log.reps}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
