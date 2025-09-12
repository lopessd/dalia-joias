"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface UploadedImage {
  url: string
  path: string
  fileName: string
  file?: File
}

interface ImageUploadProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 4, 
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Função para fazer upload de um arquivo
  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      return {
        url: result.url,
        path: result.path,
        fileName: result.fileName,
        file
      }
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error.message || 'Não foi possível fazer upload da imagem',
        variant: "destructive"
      })
      return null
    }
  }

  // Função para processar arquivos selecionados
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return
    
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Muitos arquivos",
        description: `Você pode adicionar apenas ${remainingSlots} imagem(s) a mais`,
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    const uploadPromises = fileArray.map(uploadFile)
    const uploadedImages = await Promise.all(uploadPromises)
    
    // Filtrar uploads bem-sucedidos
    const successfulUploads = uploadedImages.filter(img => img !== null) as UploadedImage[]
    
    if (successfulUploads.length > 0) {
      onImagesChange([...images, ...successfulUploads])
      
      if (successfulUploads.length < fileArray.length) {
        toast({
          title: "Upload parcialmente bem-sucedido",
          description: `${successfulUploads.length} de ${fileArray.length} imagens foram carregadas`,
          variant: "default"
        })
      } else {
        toast({
          title: "Upload bem-sucedido",
          description: `${successfulUploads.length} imagem(s) carregada(s)`,
          variant: "default"
        })
      }
    }
    
    setIsUploading(false)
  }, [images, onImagesChange, maxImages, disabled, toast])

  // Função para remover uma imagem
  const removeImage = async (index: number) => {
    if (disabled) return
    
    const imageToRemove = images[index]
    
    try {
      // Tentar deletar do storage se tiver path
      if (imageToRemove.path) {
        await fetch(`/api/upload?path=${encodeURIComponent(imageToRemove.path)}`, {
          method: 'DELETE'
        })
      }
      
      // Remover da lista local
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso",
        variant: "default"
      })
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      // Mesmo com erro na remoção do storage, remove da lista local
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
    }
  }

  // Handlers para drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles, disabled])

  // Handler para seleção de arquivo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Limpar o input para permitir reselecionar o mesmo arquivo
    e.target.value = ''
  }, [handleFiles])

  // Abrir seletor de arquivos
  const openFileSelector = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Grid de imagens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
            <img
              src={image.url}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover transition-all group-hover:scale-105"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-7 w-7 p-0 opacity-80 hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white shadow-lg rounded-full"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4 stroke-2" />
              </Button>
            )}
          </div>
        ))}
        
        {/* Botão de adicionar */}
        {images.length < maxImages && (
          <div
            className={`
              aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center
              transition-colors cursor-pointer
              ${dragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted/50'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Clique ou arraste uma imagem
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {/* Informações de limite */}
      <div className="text-xs text-muted-foreground">
        <p>• {images.length} de {maxImages} imagens adicionadas</p>
        <p>• Formatos aceitos: JPEG, PNG, WebP, GIF</p>
        <p>• Tamanho máximo: 5MB por imagem</p>
      </div>
    </div>
  )
}
