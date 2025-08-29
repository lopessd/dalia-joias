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
  title: "Dalia Joyas - Sistema de Gestão",
  description: "Sistema completo para gestão de joias e revendedores - Dalia Joyas",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["joias", "gestão", "revendedores", "estoque", "bijuterias"],
  authors: [
    {
      name: "Dalia Joyas",
    },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dalia Joyas",
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
    <html lang="pt-BR" className={inter.variable}>
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
