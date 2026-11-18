'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Dumbbell, Pencil, Check, ChevronLeft, Zap } from 'lucide-react'
import { MUSCLE_GROUPS, EXERCISE_DETAILS, MUSCLE_GROUP_COLORS, MOTIVATIONAL_QUOTES } from '@/lib/constants'
import { MuscleGroup, WeightUnit } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { format, subDays } from 'date-fns'

interface ExerciseEntry {
  exercise_name: string
  muscle_group: MuscleGroup | ''
  weight: string
  unit: WeightUnit
  sets: string
  reps: string
}

const emptyEntry = (): ExerciseEntry => ({ exercise_name: '', muscle_group: '', weight: '', unit: 'KG', sets: '', reps: '' })

const MG_EMOJI: Record<MuscleGroup, string> = {
  Chest: '🫀', Back: '🔙', Shoulder: '🏔️', Leg: '🦵', Biceps: '💪', Triceps: '🔱', 'Full Body': '⚡'
}

export default function WorkoutPage() {
  const { userId } = useUser()
  const supabase = createClient()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [mgFilter, setMgFilter] = useState<MuscleGroup | 'All'>('All')
  const [editEx, setEditEx] = useState<any | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  // new flow state
  const [step, setStep] = useState<'muscle' | 'exercises'>('muscle')
  const [selectedMG, setSelectedMG] = useState<MuscleGroup | null>(null)
  const [quickEx, setQuickEx] = useState<{ name: string; weight: string; unit: WeightUnit; sets: string; reps: string } | null>(null)
  const [name, setName] = useState('Athlete')

  useEffect(() => {
    if (!userId) return
    loadSessions()
    supabase.from('profiles').select('name').eq('id', userId).single().then(({ data }) => {
      if (data?.name) setName(data.name)
    })
  }, [userId])

  async function loadSessions() {
    if (!userId) return
    const { data } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)
    setSessions(data || [])
  }

  function selectMuscleGroup(mg: MuscleGroup) {
    setSelectedMG(mg)
    setStep('exercises')
  }

  function openQuickAdd(name: string, defaultSets: number, defaultReps: number) {
    setQuickEx({ name, weight: '', unit: 'KG', sets: String(defaultSets), reps: String(defaultReps) })
  }

  function addToSession() {
    if (!quickEx || !selectedMG || !quickEx.weight) return
    setExercises(prev => [...prev, {
      exercise_name: quickEx.name,
      muscle_group: selectedMG,
      weight: quickEx.weight,
      unit: quickEx.unit,
      sets: quickEx.sets,
      reps: quickEx.reps,
    }])
    setQuickEx(null)
    toast.success(`${quickEx.name} added!`)
  }

  // Recommend muscles not trained in last 3 days
  function getRecommendedMuscles(): MuscleGroup[] {
    const cutoff = format(subDays(new Date(), 3), 'yyyy-MM-dd')
    const recentMGs = new Set(
      sessions
        .filter(s => s.date >= cutoff)
        .flatMap((s: any) => s.exercise_logs?.map((e: any) => e.muscle_group) || [])
        .filter(Boolean)
    )
    return MUSCLE_GROUPS.filter(mg => !recentMGs.has(mg))
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!userId) return
    const valid = exercises.filter(ex => ex.exercise_name && ex.weight && ex.sets && ex.reps)
    if (valid.length === 0) return toast.error('Add at least one exercise')
    setLoading(true)

    // Fetch existing PRs
    const { data: prData } = await supabase
      .from('exercise_logs')
      .select('exercise_name, weight')
      .eq('user_id', userId!)
    const prMap: Record<string, number> = {}
    prData?.forEach((l: any) => {
      if (!prMap[l.exercise_name] || l.weight > prMap[l.exercise_name]) prMap[l.exercise_name] = l.weight
    })

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({ user_id: userId, date })
      .select().single()

    if (error || !session) { toast.error('Failed to save'); setLoading(false); return }

    await supabase.from('exercise_logs').insert(
      valid.map(ex => ({
        session_id: session.id,
        user_id: userId!,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group || null,
        weight: parseFloat(ex.weight),
        unit: ex.unit,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps),
      }))
    )

    // PR detection
    const prs = valid.filter(ex => {
      const w = parseFloat(ex.weight)
      return !prMap[ex.exercise_name] || w > prMap[ex.exercise_name]
    })
    if (prs.length > 0) {
      prs.forEach(ex => toast.success(`🏆 New PR! ${ex.exercise_name} — ${ex.weight}${ex.unit}`))
    } else {
      toast.success('Workout saved! 💪')
    }

    setExercises([])
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setStep('muscle')
    setSelectedMG(null)
    loadSessions()
    setLoading(false)
  }

  async function handleDeleteSession(sessionId: string) {
    await supabase.from('workout_sessions').delete().eq('id', sessionId)
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    toast.success('Session deleted')
  }

  async function handleDeleteExercise(exId: string, sessionId: string) {
    await supabase.from('exercise_logs').delete().eq('id', exId)
    setSessions(prev => prev.map(s => s.id === sessionId
      ? { ...s, exercise_logs: s.exercise_logs.filter((e: any) => e.id !== exId) }
      : s
    ))
    toast.success('Exercise removed')
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editEx) return
    setEditLoading(true)
    await supabase.from('exercise_logs').update({
      exercise_name: editEx.exercise_name,
      muscle_group: editEx.muscle_group || null,
      weight: parseFloat(editEx.weight),
      unit: editEx.unit,
      sets: parseInt(editEx.sets),
      reps: parseInt(editEx.reps),
    }).eq('id', editEx.id)
    setSessions(prev => prev.map(s => ({
      ...s,
      exercise_logs: s.exercise_logs?.map((e: any) => e.id === editEx.id ? { ...e, ...editEx, weight: parseFloat(editEx.weight), sets: parseInt(editEx.sets), reps: parseInt(editEx.reps) } : e)
    })))
    toast.success('Exercise updated')
    setEditEx(null)
    setEditLoading(false)
  }

  const filteredSessions = mgFilter === 'All' ? sessions : sessions.filter(s =>
    s.exercise_logs?.some((e: any) => e.muscle_group === mgFilter)
  )

  // Group sessions by date
  const groupedByDate = filteredSessions.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})
  const sortedGroupDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const quote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length]

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <p className="text-sm text-gray-500">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <p className="text-sm text-gray-400">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-900 to-gray-700 text-white mb-4">
        <CardContent className="p-4">
          <p className="text-xs opacity-60 mb-1">💬 Quote of the day</p>
          <p className="text-sm font-medium leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
        </CardContent>
      </Card>
      <Tabs defaultValue="log">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="log" className="flex-1">Log</TabsTrigger>
          <TabsTrigger value="recommend" className="flex-1">Recommend</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          {/* Step: Pick Muscle Group */}
          {step === 'muscle' && (
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1.5" />
                </CardContent>
              </Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pick Muscle Group</p>
              <div className="grid grid-cols-2 gap-3">
                {MUSCLE_GROUPS.map(mg => {
                  const color = MUSCLE_GROUP_COLORS[mg]
                  return (
                    <button key={mg} onClick={() => selectMuscleGroup(mg)}
                      className="rounded-2xl p-4 text-left shadow-sm transition-transform active:scale-95"
                      style={{ backgroundColor: `${color}15`, border: `1.5px solid ${color}40` }}>
                      <span className="text-2xl">{MG_EMOJI[mg]}</span>
                      <p className="font-semibold text-gray-800 mt-1 text-sm">{mg}</p>
                      <p className="text-xs mt-0.5" style={{ color }}>{EXERCISE_DETAILS[mg].length} exercises</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step: Pick Exercises */}
          {step === 'exercises' && selectedMG && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('muscle')} className="p-1">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MUSCLE_GROUP_COLORS[selectedMG] }} />
                <p className="font-semibold text-gray-800">{selectedMG}</p>
                {exercises.length > 0 && (
                  <Badge className="ml-auto" style={{ backgroundColor: MUSCLE_GROUP_COLORS[selectedMG] }}>
                    {exercises.length} added
                  </Badge>
                )}
              </div>

              {/* Exercise cards */}
              <div className="space-y-3">
                {EXERCISE_DETAILS[selectedMG].map(ex => (
                  <Card key={ex.name} className="border-0 shadow-sm overflow-hidden">
                    <div className="flex">
                      <div className="relative w-24 h-20 shrink-0">
                        <Image src={ex.img} alt={ex.name} fill className="object-cover" unoptimized />
                      </div>
                      <CardContent className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ex.sets} sets × {ex.reps} reps</p>
                        </div>
                        <button
                          onClick={() => openQuickAdd(ex.name, ex.sets, ex.reps)}
                          className="self-start mt-1 text-xs font-semibold px-3 py-1 rounded-full text-white"
                          style={{ backgroundColor: MUSCLE_GROUP_COLORS[selectedMG] }}>
                          + Add
                        </button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Added exercises summary */}
              {exercises.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Session ({exercises.length})</p>
                    {exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{ex.exercise_name}</span>
                        <span className="text-gray-400 text-xs ml-2">{ex.weight}{ex.unit} · {ex.sets}×{ex.reps}</span>
                        <button className="ml-2" onClick={() => setExercises(p => p.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-3.5 h-3.5 text-red-300" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setStep('muscle') }}>
                  + More Muscles
                </Button>
                <Button className="flex-1" disabled={exercises.length === 0 || loading} onClick={handleSubmit as any}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Dumbbell className="w-4 h-4 mr-1" />}
                  Save
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommend">
          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <p className="text-sm font-semibold text-gray-700">Today&apos;s Recommendation</p>
            </div>
            <p className="text-xs text-gray-400">Based on muscles not trained in the last 3 days</p>
            {getRecommendedMuscles().length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm font-semibold text-gray-700">All muscles trained recently!</p>
                  <p className="text-xs text-gray-400 mt-1">Take a rest day or do Full Body</p>
                </CardContent>
              </Card>
            ) : (
              getRecommendedMuscles().map(mg => (
                <div key={mg}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MUSCLE_GROUP_COLORS[mg] }} />
                    <p className="text-sm font-semibold text-gray-700">{mg}</p>
                    <span className="text-xs text-gray-400">— recommended today</span>
                  </div>
                  <div className="space-y-2">
                    {EXERCISE_DETAILS[mg].slice(0, 3).map(ex => (
                      <Card key={ex.name} className="border-0 shadow-sm overflow-hidden">
                        <div className="flex">
                          <div className="relative w-24 h-20 shrink-0">
                            <Image src={ex.img} alt={ex.name} fill className="object-cover" unoptimized />
                          </div>
                          <CardContent className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{ex.sets} sets × {ex.reps} reps</p>
                            </div>
                            <button
                              onClick={() => { setSelectedMG(mg); openQuickAdd(ex.name, ex.sets, ex.reps) }}
                              className="self-start mt-1 text-xs font-semibold px-3 py-1 rounded-full text-white"
                              style={{ backgroundColor: MUSCLE_GROUP_COLORS[mg] }}>
                              + Add to Session
                            </button>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Full Body Section */}
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🏋️</span>
                <p className="text-sm font-semibold text-gray-700">Full Body Workout</p>
              </div>
              <div className="space-y-2">
                {EXERCISE_DETAILS['Full Body'].map(ex => (
                  <Card key={ex.name} className="border-0 shadow-sm overflow-hidden">
                    <div className="flex">
                      <div className="relative w-24 h-20 shrink-0">
                        <Image src={ex.img} alt={ex.name} fill className="object-cover" unoptimized />
                      </div>
                      <CardContent className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{ex.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ex.sets} sets × {ex.reps} reps</p>
                        </div>
                        <button
                          onClick={() => { setSelectedMG('Full Body'); openQuickAdd(ex.name, ex.sets, ex.reps) }}
                          className="self-start mt-1 text-xs font-semibold px-3 py-1 rounded-full text-white bg-[#00897B]">
                          + Add to Session
                        </button>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {(['All', ...MUSCLE_GROUPS] as const).map(mg => (
              <button key={mg} onClick={() => setMgFilter(mg as MuscleGroup | 'All')}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  mgFilter === mg ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                {mg}
              </button>
            ))}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No workout history yet</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {sortedGroupDates.map(date => {
                const daySessions = groupedByDate[date]
                const allLogs: any[] = daySessions.flatMap((s: any) => s.exercise_logs || [])
                const uniqueMGs = [...new Set(allLogs.map((e: any) => e.muscle_group).filter(Boolean))] as MuscleGroup[]
                return (
                  <Card key={date} className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 flex">
                      {uniqueMGs.length > 0
                        ? uniqueMGs.map(mg => <div key={mg} className="flex-1" style={{ backgroundColor: MUSCLE_GROUP_COLORS[mg] }} />)
                        : <div className="flex-1 bg-gray-200" />}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(new Date(date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {uniqueMGs.map(mg => {
                              const c = MUSCLE_GROUP_COLORS[mg]
                              return <Badge key={mg} variant="secondary" className="text-xs" style={{ backgroundColor: `${c}20`, color: c }}>{mg}</Badge>
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{allLogs.length} exercises</span>
                          <button onClick={() => daySessions.forEach((s: any) => handleDeleteSession(s.id))}>
                            <Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      {allLogs.map((ex: any) => {
                        const c = ex.muscle_group ? MUSCLE_GROUP_COLORS[ex.muscle_group as MuscleGroup] : '#6b7280'
                        return (
                          <div key={ex.id} className="flex justify-between text-sm py-1 border-b last:border-0 items-center">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {ex.muscle_group && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c }} />}
                              <span className="text-gray-700 truncate">{ex.exercise_name}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span className="text-gray-500 text-xs">{ex.weight}{ex.unit} · {ex.sets}×{ex.reps}</span>
                              <button onClick={() => setEditEx({ ...ex, weight: String(ex.weight), sets: String(ex.sets), reps: String(ex.reps) })}>
                                <Pencil className="w-3.5 h-3.5 text-gray-300 hover:text-primary" />
                              </button>
                              <button onClick={() => handleDeleteExercise(ex.id, daySessions.find((s: any) => s.exercise_logs?.some((l: any) => l.id === ex.id))?.id)}>
                                <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />
                              </button>
                            </div>
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

      {/* Quick Add Dialog */}
      <Dialog open={!!quickEx} onOpenChange={open => !open && setQuickEx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{quickEx?.name}</DialogTitle></DialogHeader>
          {quickEx && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Weight</Label>
                  <Input type="number" placeholder="20" min="0" step="0.5" value={quickEx.weight}
                    onChange={e => setQuickEx(p => p ? { ...p, weight: e.target.value } : p)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Unit</Label>
                  <Select value={quickEx.unit} onValueChange={v => setQuickEx(p => p ? { ...p, unit: v as WeightUnit } : p)}>
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
                  <Input type="number" min="1" value={quickEx.sets}
                    onChange={e => setQuickEx(p => p ? { ...p, sets: e.target.value } : p)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reps</Label>
                  <Input type="number" min="1" value={quickEx.reps}
                    onChange={e => setQuickEx(p => p ? { ...p, reps: e.target.value } : p)} />
                </div>
              </div>
              <Button className="w-full" onClick={addToSession} disabled={!quickEx.weight}>
                <Check className="w-4 h-4 mr-2" /> Add to Session
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={!!editEx} onOpenChange={open => !open && setEditEx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Exercise</DialogTitle></DialogHeader>
          {editEx && (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Muscle Group</Label>
                <Select value={editEx.muscle_group || ''} onValueChange={v => setEditEx((p: any) => ({ ...p, muscle_group: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select muscle group" /></SelectTrigger>
                  <SelectContent>{MUSCLE_GROUPS.map(mg => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Exercise Name</Label>
                <Input value={editEx.exercise_name} onChange={e => setEditEx((p: any) => ({ ...p, exercise_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Weight</Label>
                  <Input type="number" value={editEx.weight} step="0.5" onChange={e => setEditEx((p: any) => ({ ...p, weight: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Unit</Label>
                  <Select value={editEx.unit} onValueChange={v => setEditEx((p: any) => ({ ...p, unit: v }))}>
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
                  <Input type="number" value={editEx.sets} min="1" onChange={e => setEditEx((p: any) => ({ ...p, sets: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reps</Label>
                  <Input type="number" value={editEx.reps} min="1" onChange={e => setEditEx((p: any) => ({ ...p, reps: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={editLoading}>
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
