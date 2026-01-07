import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
