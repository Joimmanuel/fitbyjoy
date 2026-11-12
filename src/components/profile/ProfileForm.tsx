'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, LogOut, Scale, Target, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Profile, BodyWeightLog } from '@/types'
import { format } from 'date-fns'

interface ProfileFormProps {
  profile: Profile
  bodyWeightLogs: BodyWeightLog[]
}

export default function ProfileForm({ profile, bodyWeightLogs }: ProfileFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [weightLoading, setWeightLoading] = useState(false)
  const [logs, setLogs] = useState(bodyWeightLogs)
  const [name, setName] = useState(profile.name || '')
  const [targetCalories, setTargetCalories] = useState(profile.target_calories?.toString() || '2000')
  const [weightDate, setWeightDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [bodyWeight, setBodyWeight] = useState('')

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ name, target_calories: parseInt(targetCalories) })
      .eq('id', profile.id)
    if (error) toast.error('Failed to save')
    else toast.success('Profile updated!')
    setSaving(false)
  }

  async function handleSaveWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!bodyWeight) return
    setWeightLoading(true)
    const { data, error } = await supabase
      .from('body_weight_logs')
      .insert({ user_id: profile.id, date: weightDate, weight: parseFloat(bodyWeight) })
      .select()
      .single()
    if (error) {
      toast.error('Failed to save weight')
    } else {
      setLogs(prev => [data, ...prev].slice(0, 10))
      setBodyWeight('')
      toast.success('Weight saved!')
    }
    setWeightLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JF'
  const latestWeight = logs[0]?.weight
  const prevWeight = logs[1]?.weight
  const weightDiff = latestWeight && prevWeight ? (latestWeight - prevWeight).toFixed(1) : null

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white/30">
            <AvatarFallback className="bg-white/20 text-white text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-xl">{name || 'Athlete'}</p>
            <p className="text-sm opacity-80">{profile.email}</p>
            {latestWeight && (
              <p className="text-sm opacity-90 mt-1">
                {latestWeight} KG
                {weightDiff && (
                  <span className={`ml-2 ${parseFloat(weightDiff) < 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} KG
                  </span>
                )}
              </p>
            )}
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
              <Input
                type="number"
                value={targetCalories}
                onChange={e => setTargetCalories(e.target.value)}
                min="500"
                max="10000"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-500" /> Body Weight Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={handleSaveWeight} className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (KG)</Label>
                <Input
                  type="number"
                  placeholder="82.5"
                  value={bodyWeight}
                  onChange={e => setBodyWeight(e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={weightLoading || !bodyWeight}>
              {weightLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Scale className="w-4 h-4 mr-2" />}
              Save Weight
            </Button>
          </form>

          {logs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent</p>
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm text-gray-600">
                    {format(new Date(log.date + 'T00:00:00'), 'dd MMM yyyy')}
                  </span>
                  <span className="font-semibold text-gray-900">{log.weight} KG</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
