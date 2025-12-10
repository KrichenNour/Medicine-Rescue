import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import './material-symbols.css'
import ClientLayout from '../components/ClientLayout'

export const metadata: Metadata = {
  title: 'MedSurplus Connect',
  description: 'Redistribute surplus medical supplies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}