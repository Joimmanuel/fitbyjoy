import { createClient } from '@/lib/supabase/server'
import WorkoutForm from '@/components/workout/WorkoutForm'
import WorkoutHistory from '@/components/workout/WorkoutHistory'
import PageHeader from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function WorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*, exercise_logs(*)')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(20)

  return (
    <div className="px-4 pt-6">
      <PageHeader title="Workout Log" subtitle="Track your training sessions" />
      <Tabs defaultValue="log">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="log" className="flex-1">Log Workout</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>
        <TabsContent value="log">
          <WorkoutForm userId={user!.id} />
        </TabsContent>
        <TabsContent value="history">
          <WorkoutHistory sessions={sessions || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
