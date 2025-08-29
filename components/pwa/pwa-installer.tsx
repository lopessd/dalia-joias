"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    console.log('PWA: Installer component mounted')
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('PWA: App is already installed')
        setIsInstalled(true)
      } else {
        console.log('PWA: App is not installed')
      }
    }

    checkIfInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay if not installed
      if (!isInstalled) {
        console.log('PWA: Scheduling install prompt to show in 3 seconds')
        setTimeout(() => {
          console.log('PWA: Showing install prompt')
          setShowInstallPrompt(true)
        }, 3000) // Reduced to 3 seconds for testing
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.log('PWA: Service Worker registration failed:', error)
        })
    }

    // For development: Show install prompt after delay even if beforeinstallprompt doesn't fire
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
    if (isDevelopment && !isInstalled) {
      console.log('PWA: Development mode - showing install prompt after 5 seconds regardless of beforeinstallprompt')
      setTimeout(() => {
        if (!isInstalled && !sessionStorage.getItem('pwa-install-dismissed')) {
          console.log('PWA: Development mode - forcing install prompt')
          setShowInstallPrompt(true)
        }
      }, 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        console.log('PWA: User choice:', choiceResult.outcome)
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt')
        } else {
          console.log('PWA: User dismissed the install prompt')
        }
        
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      } catch (error) {
        console.error('PWA: Error during installation:', error)
      }
    } else {
      // Fallback for development or browsers that don't support beforeinstallprompt
      console.log('PWA: No deferred prompt available - showing instructions')
      alert('Para instalar o app:\n\nChrome: Menu > Instalar app\nSafari: Compartilhar > Adicionar à Tela Inicial\nFirefox: Menu > Instalar')
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed in this session
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  // Check if user already dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-primary bg-background/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Instalar App</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Instale o Dalia Joyas para acesso rápido e use offline
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={handleInstallClick}
            className="w-full gap-2 text-xs"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Instalar Aplicativo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for PWA utilities
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isInstalled, isOnline }
}
