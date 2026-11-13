'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Flame, Search } from 'lucide-react'
import { estimateCalories } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/layout/UserProvider'
import { format } from 'date-fns'

export default function NutritionPage() {
  const { userId } = useUser()
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const [logs, setLogs] = useState<any[]>([])
  const [allLogs, setAllLogs] = useState<any[]>([])
  const [targetCalories, setTargetCalories] = useState(2000)
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [estimatedCal, setEstimatedCal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    async function load() {
      const [logsRes, allLogsRes, profileRes] = await Promise.all([
        supabase.from('nutrition_logs').select('*').eq('user_id', userId).eq('date', today).order('created_at'),
        supabase.from('nutrition_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(200),
        supabase.from('profiles').select('target_calories').eq('id', userId).single(),
      ])
      setLogs(logsRes.data || [])
      setAllLogs(allLogsRes.data || [])
      setTargetCalories(profileRes.data?.target_calories || 2000)
    }
    load()
  }, [userId])

  // Group allLogs by date
  const logsByDate = allLogs.reduce((acc: Record<string, any[]>, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})
  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a))

  const totalCalories = logs.reduce((a, l) => a + l.calories, 0)
  const progress = Math.min((totalCalories / targetCalories) * 100, 100)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!foodName.trim() || !userId) return
    setLoading(true)
    const calories = estimateCalories(foodName) * parseInt(quantity || '1')
    const { data, error } = await supabase.from('nutrition_logs').insert({
      user_id: userId, date: today, food_name: foodName.trim(),
      quantity: parseInt(quantity || '1'), calories,
    }).select().single()
    if (error) { toast.error('Failed to add food') }
    else {
      setLogs(prev => [...prev, data])
      setAllLogs(prev => [data, ...prev])
      setFoodName(''); setQuantity('1'); setEstimatedCal(null)
      toast.success(`Added ${foodName} (${calories} kcal)`)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('nutrition_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
    setAllLogs(prev => prev.filter(l => l.id !== id))
    toast.success('Removed')
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Nutrition</h1>
        <p className="text-sm text-gray-500">Track your daily calories</p>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Today&apos;s Calories</p>
              <p className="text-3xl font-bold">{totalCalories}</p>
              <p className="text-sm opacity-75">of {targetCalories} kcal target</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/30 [&>div]:bg-white" />
          <p className="text-xs opacity-75 mt-1">{Math.max(0, targetCalories - totalCalories)} kcal remaining</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="today">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card className="border-0 shadow-sm mb-4">
            <CardContent className="p-4">
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Food Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-9" placeholder="e.g. Nasi Ayam, Pisang..."
                      value={foodName} onChange={e => { setFoodName(e.target.value); setEstimatedCal(e.target.value.length > 2 ? estimateCalories(e.target.value) : null) }} />
                  </div>
                  {estimatedCal && <p className="text-xs text-green-600 font-medium">≈ {estimatedCal} kcal per serving</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-24" />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !foodName.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Food
                </Button>
              </form>
            </CardContent>
          </Card>

          {logs.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-semibold text-gray-500 px-4 py-2 border-b bg-gray-50 rounded-t-xl">
                  <span>Food</span><span className="text-center px-2">Qty</span><span className="text-right px-2">Calories</span><span></span>
                </div>
                {logs.map(log => (
                  <div key={log.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-0">
                    <span className="text-sm text-gray-800 truncate">{log.food_name}</span>
                    <span className="text-sm text-gray-500 text-center px-2">{log.quantity}</span>
                    <span className="text-sm font-semibold text-orange-600 text-right px-2">{log.calories} kcal</span>
                    <button onClick={() => handleDelete(log.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 bg-orange-50 rounded-b-xl">
                  <span className="text-sm font-bold text-gray-800">Total</span><span></span>
                  <span className="text-sm font-bold text-orange-600 text-right px-2">{totalCalories} kcal</span><span></span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No nutrition history yet</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {sortedDates.map(date => {
                const dayLogs = logsByDate[date]
                const dayTotal = dayLogs.reduce((a: number, l: any) => a + l.calories, 0)
                const dayProgress = Math.min((dayTotal / targetCalories) * 100, 100)
                const isToday = date === today
                return (
                  <Card key={date} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {isToday ? 'Today' : format(new Date(date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                          <p className="text-xs text-gray-400">{dayLogs.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">{dayTotal} kcal</p>
                          <p className="text-xs text-gray-400">{Math.round(dayProgress)}% of target</p>
                        </div>
                      </div>
                      <Progress value={dayProgress} className="h-1.5 mb-2" />
                      <div className="space-y-1">
                        {dayLogs.map((log: any) => (
                          <div key={log.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate flex-1">{log.food_name} ×{log.quantity}</span>
                            <span className="text-gray-500 ml-2 shrink-0 text-xs">{log.calories} kcal</span>
                          </div>
                        ))}
                      </div>
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
