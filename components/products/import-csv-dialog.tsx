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
import { Upload, FileSpreadsheet, X, CheckCircle, Download } from "lucide-react"
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

  const updateCellValue = (rowIndex: number, columnKey: string, value: string) => {
    setCsvData(prev => {
      const updated = [...prev]
      updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value }
      return updated
    })
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

  const handleImport = () => {
    if (csvData.length === 0) {
      toast({
        title: "Nenhum dado!",
        description: "Carregue um arquivo CSV primeiro.",
        variant: "destructive",
      })
      return
    }

    onImport(csvData)
    handleClose()
  }

  const handleClose = () => {
    setCsvData([])
    setFileName("")
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
                    <TableHead className="font-semibold text-xs border-r">nome</TableHead>
                    <TableHead className="font-semibold text-xs border-r">categoria</TableHead>
                    <TableHead className="font-semibold text-xs border-r">preco</TableHead>
                    <TableHead className="font-semibold text-xs border-r">precoPromocional</TableHead>
                    <TableHead className="font-semibold text-xs border-r">estoque</TableHead>
                    <TableHead className="font-semibold text-xs border-r">unidadeMedida</TableHead>
                    <TableHead className="font-semibold text-xs border-r">sku</TableHead>
                    <TableHead className="font-semibold text-xs border-r">descricao</TableHead>
                    <TableHead className="font-semibold text-xs border-r">imagemUrl</TableHead>
                    <TableHead className="font-semibold text-xs border-r">ativo</TableHead>
                    <TableHead className="font-semibold text-xs border-r">destacado</TableHead>
                    <TableHead className="font-semibold text-xs border-r">temVariacaoPreco</TableHead>
                    <TableHead className="font-semibold text-xs border-r">peso</TableHead>
                    <TableHead className="font-semibold text-xs">dimensoes</TableHead>
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
                      {Object.keys(csvData[0] || {}).map((key) => (
                        <TableHead key={key} className="font-semibold text-xs border-r last:border-r-0">
                          {key}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="text-xs hover:bg-gray-50">
                        {Object.keys(csvData[0] || {}).map((key) => (
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
              disabled={csvData.length === 0 || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isImporting ? (
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

