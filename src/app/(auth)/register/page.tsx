'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Dumbbell, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password minimal 6 karakter')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    })

    if (error) {
      toast.error(error.message)
    } else {
      // Also migrate any localStorage data
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await migrateLocalData(supabase, user.id, form.name)
      }
      toast.success('Akun berhasil dibuat!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  async function migrateLocalData(supabase: ReturnType<typeof createClient>, userId: string, name: string) {
    try {
      const workouts = JSON.parse(localStorage.getItem('joyfit_workouts') || '[]')
      const nutritionLogs = JSON.parse(localStorage.getItem('joyfit_nutrition') || '[]')
      const bodyWeightLogs = JSON.parse(localStorage.getItem('joyfit_bodyweight') || '[]')
      const settings = JSON.parse(localStorage.getItem('joyfit_settings') || '{}')

      await supabase.from('profiles').upsert({
        id: userId,
        name: name || settings.name || 'Athlete',
        target_calories: settings.target_calories || 2000,
      }, { onConflict: 'id' })

      for (const session of workouts) {
        const { data: newSession } = await supabase
          .from('workout_sessions')
          .insert({ user_id: userId, date: session.date, muscle_group: session.muscle_group })
          .select().single()
        if (newSession && session.exercises?.length > 0) {
          await supabase.from('exercise_logs').insert(
            session.exercises.map((ex: any) => ({
              session_id: newSession.id, user_id: userId,
              exercise_name: ex.exercise_name, weight: ex.weight,
              unit: ex.unit, sets: ex.sets, reps: ex.reps,
            }))
          )
        }
      }

      for (const log of nutritionLogs) {
        await supabase.from('nutrition_logs').insert({
          user_id: userId, date: log.date, food_name: log.food_name,
          quantity: log.quantity, calories: log.calories,
        })
      }

      for (const log of bodyWeightLogs) {
        await supabase.from('body_weight_logs').insert({
          user_id: userId, date: log.date, weight: log.weight,
        })
      }

      localStorage.removeItem('joyfit_workouts')
      localStorage.removeItem('joyfit_nutrition')
      localStorage.removeItem('joyfit_bodyweight')
      localStorage.removeItem('joyfit_settings')
    } catch (err) {
      console.error('Migration error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Joy Fit</h1>
          <p className="text-gray-500 text-sm">Personal Progress Tracker</p>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Buat Akun 💪</CardTitle>
            <CardDescription>Daftar sekali, akses dari mana saja</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nama</Label>
                <Input placeholder="Joy" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="Min. 6 karakter" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} minLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Buat Akun
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
