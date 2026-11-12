import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-lg mx-auto pb-20 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
