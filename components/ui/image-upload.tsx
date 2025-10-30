"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { createClient } from "@/lib/supabase"

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  className?: string
  bucket?: string // Supabase bucket name (default: images)
  pathPrefix?: string // e.g., stores/{storeId}/products
}

export function ImageUpload({ value = [], onChange, maxImages = 5, className, bucket = "images", pathPrefix = "products" }: ImageUploadProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const supabase = React.useMemo(() => createClient(), [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      if (!supabase) return null
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const base = file.name.replace(/\.[^/.]+$/, '')
      const safe = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const uid = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2)
      const path = `${pathPrefix}/${uid}-${safe}.${ext}`

      // 1) pede URL assinada ao backend (usa Service Role)
      const res = await fetch('/api/storage/signed-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, path })
      })

      if (!res.ok) {
        console.error('Falha ao criar URL assinada:', await res.text())
        return null
      }

      const signed = await res.json()

      // 2) faz upload usando token assinado (não depende de RLS)
      const { error: signedErr } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(signed.path, signed.token, file)

      if (signedErr) {
        console.error('Erro no upload (signed):', signedErr)
        return null
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl || null
    } catch (e) {
      console.error('Falha no upload da imagem:', e)
      return null
    }
  }

  const handleFiles = async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxImages - value.length)
    const imagesOnly = newFiles.filter(f => f.type.startsWith('image/'))
    if (imagesOnly.length === 0) return
    setIsUploading(true)

    const uploadedUrls: string[] = []
    for (const file of imagesOnly) {
      const url = await uploadFile(file)
      if (url) uploadedUrls.push(url)
    }

    if (uploadedUrls.length > 0) {
      onChange([...value, ...uploadedUrls])
    }

    setIsUploading(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          value.length >= maxImages && "opacity-50",
          value.length === 0 ? "p-6 min-h-48" : "p-0"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {value.length === 0 ? (
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {isUploading ? 'Enviando imagens...' : 'Arraste imagens aqui ou clique para selecionar'}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG até {maxImages} imagens
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-3", maxImages === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3")}> 
            {value.map((url, index) => (
              <ContextMenu key={index}>
                <ContextMenuTrigger asChild>
                  <div className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className={cn(
                        "w-full object-cover rounded-md border",
                        maxImages === 1 ? "h-72 md:h-80" : "h-56"
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      title="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {/* Hover overlay to improve affordance */}
                    <div className="pointer-events-none absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={(e) => { e.preventDefault(); removeImage(index) }}>Remover imagem</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}

        {/* Hidden file input to keep dropzone clickable */}
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
          disabled={value.length >= maxImages || isUploading}
        />
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={value.length >= maxImages || isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Enviando...' : `Adicionar Imagens (${value.length}/${maxImages})`}
      </Button>
    </div>
  )
}
