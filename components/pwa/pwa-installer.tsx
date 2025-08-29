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
        return true
      } else {
        console.log('PWA: App is not installed')
        return false
      }
    }

    const isInstalled = checkIfInstalled()

    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOSSafari = isIOS && isSafari

    console.log('PWA: Platform detection:', { isIOS, isSafari, isIOSSafari })

    // Listen for beforeinstallprompt event (Chrome/Edge only)
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
        }, 3000)
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

    // Show install prompt based on platform
    if (!isInstalled && !sessionStorage.getItem('pwa-install-dismissed')) {
      if (isIOSSafari) {
        // iOS Safari - show instructions immediately after delay
        console.log('PWA: iOS Safari detected - showing install instructions after 5 seconds')
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 5000)
      } else {
        // Other browsers - show after longer delay if beforeinstallprompt doesn't fire
        const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
        const isHTTPS = window.location.protocol === 'https:' || isDevelopment
        
        console.log('PWA: Environment check:', { isDevelopment, isHTTPS })
        
        if (isHTTPS) {
          setTimeout(() => {
            if (!isInstalled && !sessionStorage.getItem('pwa-install-dismissed') && !deferredPrompt) {
              console.log('PWA: Fallback - showing install prompt (beforeinstallprompt may not have fired)')
              setShowInstallPrompt(true)
            }
          }, 8000) // Wait longer for beforeinstallprompt
        }
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('PWA: Install button clicked')
    
    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isChrome = /chrome/i.test(navigator.userAgent)
    
    console.log('PWA: Platform detection on install:', { isIOS, isSafari, isChrome })

    if (deferredPrompt) {
      console.log('PWA: Using deferred prompt to install')
      try {
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        console.log('PWA: User choice:', choiceResult.outcome)
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt')
          setIsInstalled(true)
        } else {
          console.log('PWA: User dismissed the install prompt')
        }
        
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      } catch (error) {
        console.error('PWA: Error during installation:', error)
      }
    } else {
      // Show platform-specific instructions
      console.log('PWA: No deferred prompt available - showing platform-specific instructions')
      
      let instructions = 'Para instalar o app:\n\n'
      
      if (isIOS && isSafari) {
        instructions += '📱 Safari iOS:\n1. Toque no botão "Compartilhar" (📤)\n2. Role para baixo e toque em "Adicionar à Tela Inicial"\n3. Toque em "Adicionar"'
      } else if (isIOS && isChrome) {
        instructions += '📱 Chrome iOS:\n1. Toque no menu (⋮) no canto superior direito\n2. Toque em "Adicionar à tela inicial"\n3. Toque em "Adicionar"'
      } else if (isChrome) {
        instructions += '💻 Chrome:\n1. Clique no menu (⋮) no canto superior direito\n2. Clique em "Instalar Dália Joias..."\n3. Clique em "Instalar"'
      } else {
        instructions += '🌐 Outros navegadores:\nProcure por "Instalar app" ou "Adicionar à tela inicial" no menu do navegador'
      }
      
      alert(instructions)
      setShowInstallPrompt(false)
      sessionStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Check if user already dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  // Show install prompt if conditions are met
  if (!showInstallPrompt) {
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
            {(() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
              const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
              const isChrome = /chrome/i.test(navigator.userAgent)
              
              if (isIOS && isSafari) {
                return "Toque em Compartilhar (📤) → 'Adicionar à Tela Inicial'"
              } else if (isIOS && isChrome) {
                return "Toque no menu (⋮) → 'Adicionar à tela inicial'"
              } else if (deferredPrompt) {
                return "Instale o app para acesso rápido e use offline"
              } else {
                return "Procure 'Instalar app' no menu do navegador"
              }
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={handleInstallClick}
            className="w-full gap-2 text-xs"
            size="sm"
          >
            <Download className="h-4 w-4" />
            {(() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
              const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
              
              if (deferredPrompt) {
                return "Instalar Aplicativo"
              } else if (isIOS && isSafari) {
                return "Ver Instruções"
              } else if (isIOS) {
                return "Ver Instruções"
              } else {
                return "Como Instalar"
              }
            })()}
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
