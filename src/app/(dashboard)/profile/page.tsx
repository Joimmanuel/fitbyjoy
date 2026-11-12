export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileRes, bodyWeightRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('body_weight_logs')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(10),
  ])

  const profile = profileRes.data || {
    id: user!.id,
    name: user!.user_metadata?.name || '',
    email: user!.email || '',
    avatar_url: null,
    target_calories: 2000,
    target_weight: null,
    created_at: '',
    updated_at: '',
  }

  return (
    <div className="px-4 pt-6">
      <PageHeader title="Profile" subtitle="Manage your account" />
      <ProfileForm profile={profile} bodyWeightLogs={bodyWeightRes.data || []} />
    </div>
  )
}
