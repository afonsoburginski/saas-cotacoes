"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, X, CheckCircle, Download, Image as ImageIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { createClient } from "@/lib/supabase"

interface ImportCSVDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (products: any[]) => void
  isImporting?: boolean
}

export function ImportCSVDialog({ open, onOpenChange, onImport, isImporting = false }: ImportCSVDialogProps) {
  const { toast } = useToast()
  const [csvData, setCsvData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [localImages, setLocalImages] = useState<Map<number, File>>(new Map())
  const supabase = createClient()

  const updateCellValue = (rowIndex: number, columnKey: string, value: string) => {
    setCsvData(prev => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value }
      return updated
    })
  }

  const handleImageSelect = (rowIndex: number, file: File) => {
    // Apenas armazenar localmente - upload será feito ao importar
    setLocalImages(prev => {
      const updated = new Map(prev)
      updated.set(rowIndex, file)
      return updated
    })
  }
  
  const getLocalImageUrl = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const product: any = {}

      headers.forEach((header, index) => {
        product[header] = values[index] || ''
      })

      products.push(product)
    }

    return products
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setCsvData(parsed)
      setIsProcessing(false)
      
      toast({
        title: "CSV carregado!",
        description: `${parsed.length} produto(s) encontrado(s)`,
      })
    }
    reader.readAsText(file)
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  })

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Nenhum dado!",
        description: "Carregue um arquivo CSV primeiro.",
        variant: "destructive",
      })
      return
    }

    // Validação de campos obrigatórios antes de importar
    const missingFields: string[] = []
    csvData.forEach((row, idx) => {
      if (!row.nome?.trim()) missingFields.push(`Linha ${idx + 1}: nome`)
      if (!row.categoria?.trim()) missingFields.push(`Linha ${idx + 1}: categoria`)
      if (!row.preco || parseFloat(row.preco) <= 0) missingFields.push(`Linha ${idx + 1}: preco válido`)
    })

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios faltando!",
        description: missingFields.slice(0, 3).join(', ') + (missingFields.length > 3 ? '...' : ''),
        variant: "destructive",
      })
      return
    }

    // Upload de imagens primeiro usando Supabase
    setIsUploadingImages(true)
    const imageUrls: Map<number, string> = new Map()
    
    for (const [rowIndex, file] of localImages.entries()) {
      try {
        if (!supabase) continue
        
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const uid = Math.random().toString(36).slice(2, 11)
        const path = `products/${uid}.${ext}`
        
        // 1) Pede URL assinada ao backend
        const res = await fetch('/api/storage/signed-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket: 'images', path })
        })
        
        if (!res.ok) throw new Error('Falha ao criar URL assinada')
        
        const signed = await res.json()
        
        // 2) Faz upload usando token assinado
        const { error: signedErr } = await supabase.storage
          .from('images')
          .uploadToSignedUrl(signed.path, signed.token, file)
        
        if (signedErr) throw new Error('Erro no upload')
        
        // 3) Obtém URL pública
        const { data } = supabase.storage.from('images').getPublicUrl(path)
        imageUrls.set(rowIndex, data.publicUrl)
      } catch (error) {
        console.error(`Erro ao fazer upload da imagem ${rowIndex}:`, error)
        // Não mostrar toast para cada imagem que falhou - silencioso
      }
    }

    // Adicionar imagemUrl aos produtos (APENAS das que foram anexadas)
    const productsWithImages = csvData.map((row, index) => {
      // Remover imagemUrl falsa do CSV se não foi anexada imagem local
      const { imagemUrl, ...rowWithoutImage } = row
      return {
        ...rowWithoutImage,
        imagemUrl: imageUrls.get(index) || undefined, // Apenas URLs reais do Supabase
      }
    })

    setIsUploadingImages(false)
    onImport(productsWithImages)
    // NÃO fechar aqui - deixar o parent controlar o dialog
  }

  const handleClose = () => {
    // Cleanup dos object URLs
    localImages.forEach((file) => {
      URL.revokeObjectURL(URL.createObjectURL(file))
    })
    
    setCsvData([])
    setFileName("")
    setLocalImages(new Map())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[98vw] w-[98vw] min-w-[98vw] max-h-[95vh] overflow-y-auto !p-6 !gap-2">
        <div>
          <h2 className="text-xl font-semibold">Importar Produtos por CSV</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste seu arquivo CSV ou clique para selecionar
          </p>
        </div>

        <div className="space-y-4 -mt-2">
          {/* Formato Esperado - Tabela de Exemplo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">📋 Formato Esperado do CSV:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = '/exemplo-produtos.csv'
                  link.download = 'exemplo-produtos.csv'
                  link.click()
                }}
              >
                <Download className="h-3 w-3 mr-2" />
                Baixar Exemplo
              </Button>
            </div>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="whitespace-nowrap">
                    <TableHead className="font-semibold text-xs border-r w-24">imagem</TableHead>
                    <TableHead className="font-semibold text-xs border-r">nome</TableHead>
                    <TableHead className="font-semibold text-xs border-r">categoria</TableHead>
                    <TableHead className="font-semibold text-xs border-r">preco</TableHead>
                    <TableHead className="font-semibold text-xs border-r">estoque</TableHead>
                    <TableHead className="font-semibold text-xs border-r">unidadeMedida</TableHead>
                    <TableHead className="font-semibold text-xs border-r">sku</TableHead>
                    <TableHead className="font-semibold text-xs border-r">descricao</TableHead>
                    <TableHead className="font-semibold text-xs border-r">peso</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            
          </div>

          {/* Área de Drop */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${csvData.length > 0 ? 'bg-green-50 border-green-500' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isProcessing ? (
              <div className="space-y-3">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-600">Processando CSV...</p>
              </div>
            ) : csvData.length > 0 ? (
              <div className="space-y-3">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">{fileName}</p>
                  <p className="text-xs text-gray-600 mt-1">{csvData.length} produto(s) carregado(s)</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCsvData([])
                    setFileName("")
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? "Solte o arquivo aqui..." : "Arraste o CSV aqui"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ou clique para selecionar</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview dos Dados - EDITÁVEL */}
          {csvData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">📊 Preview e Edição dos Dados:</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Clique nas células para editar</span>
                  <Badge variant="secondary">{csvData.length} produtos</Badge>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow className="whitespace-nowrap">
                      <TableHead className="font-semibold text-xs border-r w-32">imagem</TableHead>
                      {Object.keys(csvData[0] || {})
                        .filter(key => !['imagemUrl', 'ativo', 'destacado', 'temVariacaoPreco', 'dimensoes', 'precoPromocional'].includes(key))
                        .map((key) => (
                          <TableHead key={key} className="font-semibold text-xs border-r last:border-r-0">
                            {key}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="text-xs hover:bg-gray-50">
                        {/* Coluna de Imagem */}
                        <TableCell className="p-2 border-r">
                          <div className="relative w-16 h-16 flex items-center justify-center bg-gray-50 rounded border">
                            {localImages.has(rowIndex) ? (
                              <div className="relative w-full h-full group">
                                <Image
                                  src={getLocalImageUrl(localImages.get(rowIndex)!)}
                                  alt={`Imagem ${rowIndex + 1}`}
                                  fill
                                  className="object-cover rounded"
                                />
                                <button
                                  onClick={() => {
                                    const file = localImages.get(rowIndex)!
                                    URL.revokeObjectURL(URL.createObjectURL(file))
                                    const updated = new Map(localImages)
                                    updated.delete(rowIndex)
                                    setLocalImages(updated)
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageSelect(rowIndex, file)
                                  }}
                                />
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </label>
                            )}
                          </div>
                        </TableCell>
                        {Object.keys(csvData[0] || {})
                          .filter(key => !['imagemUrl', 'ativo', 'destacado', 'temVariacaoPreco', 'dimensoes', 'precoPromocional'].includes(key))
                          .map((key) => (
                            <TableCell key={key} className="p-0 border-r last:border-r-0">
                              <input
                                type="text"
                                value={row[key] || ''}
                                onChange={(e) => updateCellValue(rowIndex, key, e.target.value)}
                                className="w-full h-full px-3 py-2 text-xs text-gray-700 bg-transparent hover:bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none border-0"
                                style={{ minWidth: '120px' }}
                              />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <p>💡 Edite qualquer valor clicando na célula</p>
                <p>Mostrando todos os {csvData.length} produtos</p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={csvData.length === 0 || isImporting || isUploadingImages}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting || isUploadingImages ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Importar {csvData.length} produto(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

