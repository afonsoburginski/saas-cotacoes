"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Product } from "@/lib/types"
import { Package, DollarSign, Hash, FileText, Image as ImageIcon } from "lucide-react"

interface ProductFormProps {
  product?: Product
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: ProductFormData) => void
}

export interface ProductFormData {
  nome: string
  categoria: string
  preco: number
  precoPromocional?: number
  estoque: number
  unidadeMedida: string
  sku: string
  descricao: string
  imagens: string[]
  ativo: boolean
  destacado: boolean
  temVariacaoPreco: boolean
  peso?: number
  dimensoes?: {
    comprimento: number
    largura: number
    altura: number
  }
}

const categorias = [
  "Cimento", "Tijolos", "Areia", "Ferro", "Brita", "Telhas", "Tintas",
  "Madeira", "Aço", "Vidro", "Plástico", "Cerâmica", "Pedra", "Outros"
]

const unidadesMedida = [
  "Unidade (un)",
  "Metro (m)",
  "Metro Quadrado (m²)",
  "Metro Cúbico (m³)",
  "Quilograma (kg)",
  "Tonelada (t)",
  "Saco (sc)",
  "Pacote (pct)",
  "Caixa (cx)",
  "Litro (L)",
  "Galão (gal)",
  "Barra (barra)",
  "Peça (pç)",
  "Rolo (rolo)",
  "Lata (lata)",
  "Balde (balde)"
]

export function ProductForm({ product, isOpen, onClose, onSubmit }: ProductFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ProductFormData>({
    nome: product?.nome || "",
    categoria: product?.categoria || "",
    preco: product?.preco || 0,
    precoPromocional: product?.precoPromocional || 0,
    estoque: product?.estoque || 0,
    unidadeMedida: product?.unidadeMedida || "Unidade (un)",
    sku: product?.sku || "",
    descricao: product?.descricao || "",
    imagens: product?.imagens || [],
    ativo: product?.ativo ?? true,
    destacado: product?.destacado ?? false,
    temVariacaoPreco: product?.temVariacaoPreco ?? false,
    peso: product?.peso || 0,
    dimensoes: product?.dimensoes || { comprimento: 0, largura: 0, altura: 0 }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validação básica
      if (!formData.nome || !formData.categoria || !formData.sku || !formData.unidadeMedida) {
        toast({
          title: "Erro de validação",
          description: "Nome, categoria, SKU e unidade de medida são obrigatórios.",
          variant: "destructive",
        })
        return
      }

      if (formData.preco <= 0) {
        toast({
          title: "Erro de validação",
          description: "O preço deve ser maior que zero.",
          variant: "destructive",
        })
        return
      }

      await onSubmit(formData)
      
      toast({
        title: product ? "Produto atualizado!" : "Produto criado!",
        description: `O produto "${formData.nome}" foi ${product ? "atualizado" : "criado"} com sucesso.`,
      })
      
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSKU = () => {
    const prefix = formData.categoria.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    setFormData(prev => ({ ...prev, sku: `${prefix}-${timestamp}-${random}` }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {product ? "Atualize as informações do produto" : "Adicione um novo produto ao seu catálogo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5 text-gray-600" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cimento Portland CP II-E 50kg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o produto, suas características e aplicações..."
                rows={3}
              />
            </div>
          </div>

          {/* SKU e Identificação */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <Hash className="h-5 w-5 text-gray-600" />
              Identificação e Medida
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium text-gray-700">SKU (Código do Produto) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Ex: CIM-123456-ABC"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSKU}
                    className="shrink-0"
                  >
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadeMedida" className="text-sm font-medium text-gray-700">Unidade de Medida *</Label>
                <Select
                  value={formData.unidadeMedida}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unidadeMedida: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesMedida.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Preços */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Preços e Valores
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco" className="text-sm font-medium text-gray-700">Preço Base (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-500">Preço unitário padrão</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoPromocional" className="text-sm font-medium text-gray-700">Preço Promocional (R$)</Label>
                <Input
                  id="precoPromocional"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoPromocional || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, precoPromocional: parseFloat(e.target.value) || undefined }))}
                  placeholder="0,00 (opcional)"
                />
                <p className="text-xs text-gray-500">Preço em promoção</p>
              </div>
            </div>

            {/* Switch para Variação de Preços */}
            <div className="pt-4 border-t border-dashed border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <Label htmlFor="temVariacaoPreco" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Variação de Preço
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ative se o preço varia e requer contato com o vendedor
                  </p>
                </div>
                <Switch
                  id="temVariacaoPreco"
                  checked={formData.temVariacaoPreco}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temVariacaoPreco: checked }))}
                />
              </div>
              
              {formData.temVariacaoPreco && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs text-amber-800">
                    ℹ️ Cliente verá "Preço sob consulta" e precisará entrar em contato para negociar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estoque e Status */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <Package className="h-5 w-5 text-gray-600" />
              Estoque e Configurações
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estoque" className="text-sm font-medium text-gray-700">Quantidade em Estoque *</Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  value={formData.estoque}
                  onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="peso" className="text-sm font-medium text-gray-700">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.peso || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso: parseFloat(e.target.value) || undefined }))}
                  placeholder="0.0 (opcional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Status do Produto</Label>
              <div className="flex items-center space-x-6 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo" className="cursor-pointer text-sm">Produto Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="destacado"
                    checked={formData.destacado}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destacado: checked }))}
                  />
                  <Label htmlFor="destacado" className="cursor-pointer text-sm">Produto Destacado</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensões */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <Package className="h-5 w-5 text-gray-600" />
              Dimensões (cm)
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comprimento" className="text-sm font-medium text-gray-700">Comprimento</Label>
                <Input
                  id="comprimento"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensoes?.comprimento || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensoes: { 
                      ...prev.dimensoes!, 
                      comprimento: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="largura" className="text-sm font-medium text-gray-700">Largura</Label>
                <Input
                  id="largura"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensoes?.largura || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensoes: { 
                      ...prev.dimensoes!, 
                      largura: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura" className="text-sm font-medium text-gray-700">Altura</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensoes?.altura || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensoes: { 
                      ...prev.dimensoes!, 
                      altura: parseFloat(e.target.value) || 0 
                    } 
                  }))}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <ImageIcon className="h-5 w-5 text-gray-600" />
              Imagens do Produto
            </h3>
            
            <ImageUpload
              value={formData.imagens}
              onChange={(imagens) => setFormData(prev => ({ ...prev, imagens }))}
              maxImages={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : product ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
