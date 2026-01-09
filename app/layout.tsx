import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Inter } from "next/font/google"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
  weight: ["400"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
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
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
