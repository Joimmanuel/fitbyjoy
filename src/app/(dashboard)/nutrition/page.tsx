import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import NutritionTracker from '@/components/nutrition/NutritionTracker'
import { format } from 'date-fns'

export default async function NutritionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = format(new Date(), 'yyyy-MM-dd')

  const [profileRes, logsRes] = await Promise.all([
    supabase.from('profiles').select('target_calories').eq('id', user!.id).single(),
    supabase.from('nutrition_logs')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .order('created_at', { ascending: true }),
  ])

  return (
    <div className="px-4 pt-6">
      <PageHeader title="Nutrition" subtitle="Track your daily calories" />
      <NutritionTracker
        userId={user!.id}
        todayLogs={logsRes.data || []}
        targetCalories={profileRes.data?.target_calories || 2000}
      />
    </div>
  )
}
