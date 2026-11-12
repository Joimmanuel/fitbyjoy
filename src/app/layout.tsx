import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import UserProvider from '@/components/layout/UserProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Joy Fit - Personal Progress Tracker',
  description: 'Track your gym progress, workouts, and nutrition',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
