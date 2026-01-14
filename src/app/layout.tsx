import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Marine Cargo Agencies Private Limited - Image Render Tool',
  description: 'Professional image documentation tool for marine cargo operations',
  keywords: ['marine cargo', 'image render', 'documentation tool'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
