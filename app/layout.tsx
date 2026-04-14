import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import '@/styles/globals.css'
import TopNavbar from '@/components/TopNavbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Q.Labs | Track Live Data Instantly',
  description: 'Follow real-world data and use it instantly in Google Sheets, Excel, or your own tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className={`font-sans bg-[#F6F6F6] text-[#2F2F2F] antialiased`}>
        <TopNavbar />
        {children}
      </body>
    </html>
  )
}
