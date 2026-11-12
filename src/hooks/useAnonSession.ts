'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWorkouts, getNutritionLogs, getBodyWeightLogs, getSettings } from '@/lib/storage'

export function useAnonSession() {
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      // Check existing session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUserId(session.user.id)
        setReady(true)
        return
      }

      // Sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error || !data.user) {
        setReady(true)
        return
      }

      const uid = data.user.id
      setUserId(uid)

      // Migrate localStorage data to Supabase
      await migrateLocalData(supabase, uid)
      setReady(true)
    }

    init()
  }, [])

  return { userId, ready }
}

async function migrateLocalData(supabase: ReturnType<typeof createClient>, userId: string) {
  const workouts = getWorkouts()
  const nutritionLogs = getNutritionLogs()
  const bodyWeightLogs = getBodyWeightLogs()
  const settings = getSettings()

  // Migrate profile/settings
  await supabase.from('profiles').upsert({
    id: userId,
    name: settings.name,
    target_calories: settings.target_calories,
  }, { onConflict: 'id' })

  // Migrate workouts
  for (const session of workouts) {
    const { data: existing } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('date', session.date)
      .eq('muscle_group', session.muscle_group)
      .single()

    if (!existing) {
      const { data: newSession } = await supabase
        .from('workout_sessions')
        .insert({ user_id: userId, date: session.date, muscle_group: session.muscle_group })
        .select()
        .single()

      if (newSession && session.exercises.length > 0) {
        await supabase.from('exercise_logs').insert(
          session.exercises.map(ex => ({
            session_id: newSession.id,
            user_id: userId,
            exercise_name: ex.exercise_name,
            weight: ex.weight,
            unit: ex.unit,
            sets: ex.sets,
            reps: ex.reps,
          }))
        )
      }
    }
  }

  // Migrate nutrition logs
  for (const log of nutritionLogs) {
    const { data: existing } = await supabase
      .from('nutrition_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', log.date)
      .eq('food_name', log.food_name)
      .single()

    if (!existing) {
      await supabase.from('nutrition_logs').insert({
        user_id: userId,
        date: log.date,
        food_name: log.food_name,
        quantity: log.quantity,
        calories: log.calories,
      })
    }
  }

  // Migrate body weight logs
  for (const log of bodyWeightLogs) {
    const { data: existing } = await supabase
      .from('body_weight_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', log.date)
      .single()

    if (!existing) {
      await supabase.from('body_weight_logs').insert({
        user_id: userId,
        date: log.date,
        weight: log.weight,
      })
    }
  }

  // Clear localStorage after migration
  localStorage.removeItem('joyfit_workouts')
  localStorage.removeItem('joyfit_nutrition')
  localStorage.removeItem('joyfit_bodyweight')
  localStorage.removeItem('joyfit_settings')
}
