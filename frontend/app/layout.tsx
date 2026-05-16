import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DetectX-PCB | AI-Native Defect Detection',
  description: 'High-speed AI computer vision protocol for PCB manufacturing.',
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
