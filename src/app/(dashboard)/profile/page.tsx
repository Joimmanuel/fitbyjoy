'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, Target, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'

export default function ProfilePage() {
  const { userId } = useUser()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [targetCalories, setTargetCalories] = useState('2000')
  const [weeklyGoal, setWeeklyGoal] = useState('4')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) return
    async function load() {
      const profileRes = await supabase.from('profiles').select('name, target_calories, weekly_goal').eq('id', userId).single()
      setName(profileRes.data?.name || '')
      setTargetCalories(profileRes.data?.target_calories?.toString() || '2000')
      setWeeklyGoal(profileRes.data?.weekly_goal?.toString() || '4')
    }
    load()
  }, [userId])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: userId, name, target_calories: parseInt(targetCalories), weekly_goal: parseInt(weeklyGoal) }, { onConflict: 'id' })
    toast.success('Profile updated!')
    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleSaveWeight(e: React.FormEvent) {
    e.preventDefault()
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JF'

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your settings</p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#00BFA5] to-[#00897B] text-white">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white/30">
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-xl">{name || 'Athlete'}</p>
            <p className="text-sm opacity-80">Joy Fit Tracker</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Daily Calorie Target
              </Label>
              <Input type="number" value={targetCalories} onChange={e => setTargetCalories(e.target.value)} min="500" max="10000" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Weekly Workout Goal
              </Label>
              <Input type="number" value={weeklyGoal} onChange={e => setWeeklyGoal(e.target.value)} min="1" max="7" />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <button onClick={handleLogout} className="w-full text-sm text-red-500 py-3 text-center font-medium">
        Sign Out
      </button>
    </div>
  )
}
