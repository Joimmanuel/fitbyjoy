'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Flame, Search } from 'lucide-react'
import { estimateCalories } from '@/lib/constants'
import { NutritionLog } from '@/types'
import { format } from 'date-fns'

interface NutritionTrackerProps {
  userId: string
  todayLogs: NutritionLog[]
  targetCalories: number
}

export default function NutritionTracker({ userId, todayLogs, targetCalories }: NutritionTrackerProps) {
  const supabase = createClient()
  const [logs, setLogs] = useState<NutritionLog[]>(todayLogs)
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [estimatedCal, setEstimatedCal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const totalCalories = logs.reduce((acc, l) => acc + l.calories, 0)
  const progress = Math.min((totalCalories / targetCalories) * 100, 100)

  function handleFoodChange(val: string) {
    setFoodName(val)
    if (val.length > 2) {
      setEstimatedCal(estimateCalories(val))
    } else {
      setEstimatedCal(null)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!foodName.trim()) return
    const calories = estimateCalories(foodName) * parseInt(quantity || '1')
    setLoading(true)

    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: userId,
        date: format(new Date(), 'yyyy-MM-dd'),
        food_name: foodName.trim(),
        quantity: parseInt(quantity || '1'),
        calories,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add food')
    } else {
      setLogs(prev => [...prev, data])
      setFoodName('')
      setQuantity('1')
      setEstimatedCal(null)
      toast.success(`Added ${foodName} (${calories} kcal)`)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('nutrition_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
    toast.success('Removed')
  }

  return (
    <div className="space-y-4">
      {/* Calorie Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white">
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

      {/* Add Food Form */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Food Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="e.g. Nasi Ayam, Pisang..."
                  value={foodName}
                  onChange={e => handleFoodChange(e.target.value)}
                />
              </div>
              {estimatedCal && (
                <p className="text-xs text-green-600 font-medium">
                  ≈ {estimatedCal} kcal per serving
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-24"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !foodName.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Food
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Food Log Table */}
      {logs.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-semibold text-gray-500 px-4 py-2 border-b bg-gray-50 rounded-t-xl">
              <span>Food</span>
              <span className="text-center px-2">Qty</span>
              <span className="text-right px-2">Calories</span>
              <span></span>
            </div>
            {logs.map(log => (
              <div key={log.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-0">
                <span className="text-sm text-gray-800 truncate">{log.food_name}</span>
                <span className="text-sm text-gray-500 text-center px-2">{log.quantity}</span>
                <span className="text-sm font-semibold text-orange-600 text-right px-2">{log.calories} kcal</span>
                <button onClick={() => handleDelete(log.id)} className="ml-1">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 bg-orange-50 rounded-b-xl">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span></span>
              <span className="text-sm font-bold text-orange-600 text-right px-2">{totalCalories} kcal</span>
              <span></span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
