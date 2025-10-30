"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import { CurrencyInput } from "@/components/ui/currency-input"
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
import { Package, DollarSign, Hash, FileText, Image as ImageIcon, Search } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { useUnits } from "@/hooks/use-units"

interface ProductFormProps {
  product?: Product
  isOpen: boolean
  onClose: () => void
  onSubmit: (productData: ProductFormData) => void
  storeId: string
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
  imagemUrl?: string // URL única da imagem no Supabase Storage
  ativo: boolean
  destacado: boolean
  temVariacaoPreco: boolean
  precoHabilitado?: boolean
  peso?: number
  dimensoes?: {
    comprimento: number
    largura: number
    altura: number
  }
}

// Opções dinâmicas via hooks; manteremos fallback vazio se não carregar

export function ProductForm({ product, isOpen, onClose, onSubmit, storeId }: ProductFormProps) {
  const { toast } = useToast()
  const { data: catResp } = useCategories({ tipo: 'produto' })
  const categoryOptions = catResp?.data ?? []
  const { data: unitsResp } = useUnits()
  const unitOptions = unitsResp?.data ?? []
  const [categorySearch, setCategorySearch] = useState("")
  const [unitSearch, setUnitSearch] = useState("")
  const [formData, setFormData] = useState<ProductFormData>({
    nome: product?.nome || "",
    categoria: product?.categoria || "",
    preco: product?.preco || 0,
    precoPromocional: product?.precoPromocional || 0,
    estoque: product?.estoque || 0,
    unidadeMedida: product?.unidadeMedida || "Unidade (un)",
    sku: product?.sku || "",
    descricao: product?.descricao || "",
    imagemUrl: product?.imagemUrl || "",
    ativo: product?.ativo ?? true,
    destacado: product?.destacado ?? false,
    temVariacaoPreco: product?.temVariacaoPreco ?? false,
    precoHabilitado: product?.preco ? true : false,
    peso: product?.peso || 0,
    dimensoes: product?.dimensoes || { comprimento: 0, largura: 0, altura: 0 }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derivar requisitos conforme unidade escolhida (usando tabela measurement_units)
  const selectedUnit = unitOptions.find(u => u.nome === formData.unidadeMedida)
  const getMeasureKind = (): "unit" | "length" | "area" | "volume" | "weight" => selectedUnit?.tipo as any || "unit"
  const getUnitAbbrev = (): string => selectedUnit?.abreviacao || "un"

  const measureKind = getMeasureKind()
  const requiresVolume = measureKind === "volume"
  const requiresArea = measureKind === "area"
  const requiresLength = measureKind === "length"
  const requiresWeight = measureKind === "weight"
  const dimUnit = requiresVolume || requiresArea || requiresLength ? "m" : "cm"
  const unitAbbrev = getUnitAbbrev()

  // Máscara para estoque com sufixo de unidade
  const [estoqueDisplay, setEstoqueDisplay] = useState<string>(
    formData.estoque ? `${formData.estoque} ${unitAbbrev}` : ""
  )

  React.useEffect(() => {
    // Atualiza a máscara quando a unidade muda
    setEstoqueDisplay(formData.estoque ? `${formData.estoque} ${unitAbbrev}` : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.unidadeMedida])

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

      if (formData.precoHabilitado) {
        if (formData.preco <= 0) {
          toast({
            title: "Erro de validação",
            description: "O preço deve ser maior que zero quando habilitado.",
            variant: "destructive",
          })
          return
        }
      }

      // Validações condicionais por unidade de medida
      if (requiresWeight) {
        const pesoVal = formData.peso ?? 0
        if (pesoVal <= 0) {
          toast({
            title: "Erro de validação",
            description: "Informe o peso em kg (maior que zero).",
            variant: "destructive",
          })
          return
        }
      }

      if (requiresLength) {
        const comprimento = formData.dimensoes?.comprimento ?? 0
        if (comprimento <= 0) {
          toast({
            title: "Erro de validação",
            description: "Informe o comprimento em metros (maior que zero).",
            variant: "destructive",
          })
          return
        }
      }

      if (requiresArea) {
        const comprimento = formData.dimensoes?.comprimento ?? 0
        const largura = formData.dimensoes?.largura ?? 0
        if (comprimento <= 0 || largura <= 0) {
          toast({
            title: "Erro de validação",
            description: "Informe comprimento e largura em metros (maiores que zero).",
            variant: "destructive",
          })
          return
        }
      }

      if (requiresVolume) {
        const comprimento = formData.dimensoes?.comprimento ?? 0
        const largura = formData.dimensoes?.largura ?? 0
        const altura = formData.dimensoes?.altura ?? 0
        if (comprimento <= 0 || largura <= 0 || altura <= 0) {
          toast({
            title: "Erro de validação",
            description: "Informe comprimento, largura e altura em metros (maiores que zero).",
            variant: "destructive",
          })
          return
        }
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
                  <SelectContent inline>
                    <div className="relative p-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar categoria"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    {categoryOptions
                      .filter(c => !categorySearch || c.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map((categoria) => (
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
                  <SelectContent inline>
                    <div className="relative p-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar unidade"
                        value={unitSearch}
                        onChange={(e) => setUnitSearch(e.target.value)}
                        className="h-8 pl-7 bg-transparent border border-gray-300 rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    {unitOptions
                      .filter(u => !unitSearch || u.nome.toLowerCase().includes(unitSearch.toLowerCase()))
                      .map((u) => (
                      <SelectItem key={u.id} value={u.nome}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* UI combinada: Estoque, Status e Medidas condicionais */}
            <div className="pt-4 mt-2 border-t border-dashed border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estoque" className="text-sm font-medium text-gray-700">Quantidade em Estoque *</Label>
                  <Input
                    id="estoque"
                    value={estoqueDisplay}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '')
                      const num = parseInt(digits || '0', 10)
                      setFormData(prev => ({ ...prev, estoque: isNaN(num) ? 0 : num }))
                      setEstoqueDisplay(digits ? `${parseInt(digits, 10)} ${unitAbbrev}` : '')
                    }}
                    placeholder={`0 ${unitAbbrev}`}
                    required
                  />
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

              {(requiresWeight || requiresLength || requiresArea || requiresVolume) && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">
                    {requiresWeight ? "Peso" : "Medidas"} {requiresWeight ? "(kg)" : `(${dimUnit})`}
                  </div>

                  {requiresWeight && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso" className="text-sm font-medium text-gray-700">Peso (kg) *</Label>
                        <Input
                          id="peso"
                          value={formData.peso || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                            setFormData(prev => ({ ...prev, peso: parseFloat(value) || undefined }))
                          }}
                          placeholder="0.0"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {(requiresLength || requiresArea || requiresVolume) && (
                    <div className={`grid gap-4 ${requiresVolume ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                      <div className="space-y-2">
                        <Label htmlFor="comprimento" className="text-sm font-medium text-gray-700">Comprimento ({dimUnit}) *</Label>
                        <Input
                          id="comprimento"
                          value={formData.dimensoes?.comprimento || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                            setFormData(prev => ({ 
                              ...prev, 
                              dimensoes: { ...prev.dimensoes!, comprimento: parseFloat(value) || 0 } 
                            }))
                          }}
                          placeholder={`0.0 ${dimUnit}`}
                          required
                        />
                      </div>

                      {(requiresArea || requiresVolume) && (
                        <div className="space-y-2">
                          <Label htmlFor="largura" className="text-sm font-medium text-gray-700">Largura ({dimUnit}) *</Label>
                          <Input
                            id="largura"
                            value={formData.dimensoes?.largura || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                              setFormData(prev => ({ 
                                ...prev, 
                                dimensoes: { ...prev.dimensoes!, largura: parseFloat(value) || 0 } 
                              }))
                            }}
                            placeholder={`0.0 ${dimUnit}`}
                            required
                          />
                        </div>
                      )}

                      {requiresVolume && (
                        <div className="space-y-2">
                          <Label htmlFor="altura" className="text-sm font-medium text-gray-700">Altura ({dimUnit}) *</Label>
                          <Input
                            id="altura"
                            value={formData.dimensoes?.altura || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                              setFormData(prev => ({ 
                                ...prev, 
                                dimensoes: { ...prev.dimensoes!, altura: parseFloat(value) || 0 } 
                              }))
                            }}
                            placeholder={`0.0 ${dimUnit}`}
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3">
                    {requiresVolume && (
                      <span>Para itens por volume (m³), informe comprimento, largura e altura em metros. Ex.: Areia por m³.</span>
                    )}
                    {requiresArea && (
                      <span>Para itens por área (m²), informe comprimento e largura em metros. Ex.: Pisos, revestimentos.</span>
                    )}
                    {requiresLength && (
                      <span>Para itens por metro (m), informe o comprimento total em metros.</span>
                    )}
                    {requiresWeight && (
                      <span>Para itens por peso (kg/t), informe o peso por unidade.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preços + Imagem lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b-2 border-dashed border-gray-300">
            {/* Preços */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <DollarSign className="h-5 w-5 text-gray-600" />
                Preços e Valores
              </h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <Label htmlFor="precoHabilitado" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Definir preço de referência
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Preço interno para sua referência. Clientes sempre veem "Sob consulta"
                  </p>
                </div>
                <Switch id="precoHabilitado" checked={!!formData.precoHabilitado} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, precoHabilitado: checked }))} />
              </div>
              {formData.precoHabilitado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco" className="text-sm font-medium text-gray-700">Preço Base (R$) *</Label>
                    <CurrencyInput id="preco" value={formData.preco} onValueChange={(value) => setFormData(prev => ({ ...prev, preco: value || 0 }))} required />
                    <p className="text-xs text-gray-500">Preço unitário padrão</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precoPromocional" className="text-sm font-medium text-gray-700">Preço Promocional (R$)</Label>
                    <CurrencyInput id="precoPromocional" value={formData.precoPromocional} onValueChange={(value) => setFormData(prev => ({ ...prev, precoPromocional: value }))} />
                    <p className="text-xs text-gray-500">Preço em promoção</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">Preço sob consulta — o cliente fará orçamento pelo carrinho.</div>
              )}
              <div className="pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <Label htmlFor="temVariacaoPreco" className="text-sm font-medium text-gray-700 cursor-pointer">Variação de Preço</Label>
                    <p className="text-xs text-gray-500 mt-1">Ative se o preço varia e requer contato com o vendedor</p>
                  </div>
                  <Switch id="temVariacaoPreco" checked={formData.temVariacaoPreco} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, temVariacaoPreco: checked }))} />
                </div>
                {formData.temVariacaoPreco && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-800">ℹ️ Cliente verá "Preço sob consulta" e precisará entrar em contato para negociar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Imagem do Produto */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                Imagem do Produto
              </h3>
              <ImageUpload
                value={formData.imagemUrl ? [formData.imagemUrl] : []}
                onChange={(urls) => setFormData(prev => ({ ...prev, imagemUrl: urls[0] || '' }))}
                maxImages={1}
                bucket="images"
                pathPrefix={`stores/${storeId}/products`}
              />
            </div>
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
