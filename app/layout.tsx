import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-context"
import { AuthDebugger } from "@/components/auth/auth-debugger"
import { PWAInstaller } from "@/components/pwa/pwa-installer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Dalia Joyas - Sistema de Gestión",
  description: "Sistema completo para gestión de joyas y distribuidores - Dalia Joyas",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["joyas", "gestión", "distribuidores", "stock", "bisutería"],
  authors: [
    {
      name: "Dalia Joyas",
    },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dalia Joyas",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Dalia Joyas",
    title: "Dalia Joyas - Sistema de Gestão",
    description: "Sistema completo para gestão de joias e revendedores",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4AF37" },
    { media: "(prefers-color-scheme: dark)", color: "#D4AF37" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-PY" className={inter.variable}>
      <head>
        {/* iOS Specific Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dalia Joyas" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Startup Images for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Prevent automatic detection of phone numbers */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <AuthDebugger />
          {children}
          <PWAInstaller />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
