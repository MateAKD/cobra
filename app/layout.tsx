import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"

const podiumSharp = localFont({
  src: "./fonts/PodiumSharp-411.otf",
  variable: "--font-podium",
  display: "swap",
})

const gotham = localFont({
  src: "./fonts/Gotham-ExtraLight.otf",
  variable: "--font-gotham",
  display: "swap",
})


export const metadata: Metadata = {
  title: "Cobra - Menú 2025",
  description: "Menú gastronómico elegante y moderno - Bar Restaurante Cobra",
  generator: "v0.app",
  icons: {
    icon: "/Logo cobra sf.png",
    shortcut: "/Logo cobra sf.png",
    apple: "/Logo cobra sf.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${podiumSharp.variable} ${gotham.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Viewport handled by export above */}
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
