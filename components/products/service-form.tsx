"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Service } from "@/lib/types"
import { Package, DollarSign, Briefcase } from "lucide-react"

interface ServiceFormProps {
  service?: Service
  isOpen: boolean
  onClose: () => void
  onSubmit: (serviceData: ServiceFormData) => void
}

export interface ServiceFormData {
  nome: string
  categoria: string
  preco: number
  precoMinimo?: number
  precoMaximo?: number
  tipoPrecificacao: 'hora' | 'dia' | 'projeto' | 'm2' | 'visita'
  descricao: string
  ativo: boolean
  destacado: boolean
}

const serviceCategories = [
  "Alvenaria",
  "Elétrica", 
  "Hidráulica",
  "Pintura",
  "Acabamento",
  "Marcenaria",
  "Serralheria",
  "Gesso",
  "Vidraçaria",
  "Jardinagem",
  "Limpeza",
  "Outros"
]

const tiposPrecificacao = [
  { value: "hora", label: "Por Hora" },
  { value: "dia", label: "Por Dia" },
  { value: "projeto", label: "Por Projeto" },
  { value: "m2", label: "Por m²" },
  { value: "visita", label: "Por Visita" },
]

export function ServiceForm({ service, isOpen, onClose, onSubmit }: ServiceFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ServiceFormData>({
    nome: service?.nome || "",
    categoria: service?.categoria || "",
    preco: service?.preco || 0,
    precoMinimo: service?.precoMinimo,
    precoMaximo: service?.precoMaximo,
    tipoPrecificacao: service?.tipoPrecificacao || "hora",
    descricao: service?.descricao || "",
    ativo: service?.ativo ?? true,
    destacado: service?.destacado ?? false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVariacao, setHasVariacao] = useState(!!(service?.precoMinimo || service?.precoMaximo))

  useEffect(() => {
    if (service) {
      setFormData({
        nome: service.nome,
        categoria: service.categoria,
        preco: service.preco,
        precoMinimo: service.precoMinimo,
        precoMaximo: service.precoMaximo,
        tipoPrecificacao: service.tipoPrecificacao,
        descricao: service.descricao || "",
        ativo: service.ativo,
        destacado: service.destacado ?? false,
      })
      setHasVariacao(!!(service.precoMinimo || service.precoMaximo))
    }
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validações
      if (!formData.nome.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.categoria) {
        toast({
          title: "Erro de validação",
          description: "Categoria é obrigatória",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!hasVariacao && formData.preco <= 0) {
        toast({
          title: "Erro de validação",
          description: "Preço deve ser maior que zero",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (hasVariacao && (!formData.precoMinimo || !formData.precoMaximo)) {
        toast({
          title: "Erro de validação",
          description: "Informe o preço mínimo e máximo",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (hasVariacao && formData.precoMinimo! > formData.precoMaximo!) {
        toast({
          title: "Erro de validação",
          description: "Preço mínimo não pode ser maior que o máximo",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      onSubmit(formData)
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o serviço",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[95vh] overflow-y-auto w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="h-5 w-5" />
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {service 
              ? 'Atualize as informações do serviço'
              : 'Preencha os dados para cadastrar um novo serviço'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <Package className="h-5 w-5 text-gray-600" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Pedreiro Profissional"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">Especialidade *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva os serviços oferecidos, experiência, qualificações..."
                rows={4}
              />
            </div>
          </div>

          {/* Precificação */}
          <div className="space-y-4 pb-6 border-b-2 border-dashed border-gray-300">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Precificação
            </h3>

            <div className="space-y-2">
              <Label htmlFor="tipoPrecificacao" className="text-sm font-medium text-gray-700">Tipo de Cobrança *</Label>
              <Select
                value={formData.tipoPrecificacao}
                onValueChange={(value) => setFormData({ ...formData, tipoPrecificacao: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposPrecificacao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Switch
                id="hasVariacao"
                checked={hasVariacao}
                onCheckedChange={setHasVariacao}
              />
              <Label htmlFor="hasVariacao" className="text-sm cursor-pointer font-medium">
                Trabalho com faixa de preço (mínimo e máximo)
              </Label>
            </div>

            {!hasVariacao ? (
              <div className="space-y-2">
                <Label htmlFor="preco" className="text-sm font-medium text-gray-700">
                  Preço (por {tiposPrecificacao.find(t => t.value === formData.tipoPrecificacao)?.label.toLowerCase().replace('por ', '')}) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                  <Input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precoMinimo" className="text-sm font-medium text-gray-700">Preço Mínimo *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <Input
                      id="precoMinimo"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precoMinimo || ""}
                      onChange={(e) => setFormData({ ...formData, precoMinimo: parseFloat(e.target.value) || undefined })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoMaximo" className="text-sm font-medium text-gray-700">Preço Máximo *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <Input
                      id="precoMaximo"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precoMaximo || ""}
                      onChange={(e) => setFormData({ ...formData, precoMaximo: parseFloat(e.target.value) || undefined })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status e Visibilidade */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Status e Visibilidade</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="ativo" className="text-sm font-medium">Serviço Ativo</Label>
                  <p className="text-xs text-gray-500">
                    Serviço disponível para contratação
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="destacado" className="text-sm font-medium">Destacar Serviço</Label>
                  <p className="text-xs text-gray-500">
                    Aparecerá em posição de destaque no catálogo
                  </p>
                </div>
                <Switch
                  id="destacado"
                  checked={formData.destacado}
                  onCheckedChange={(checked) => setFormData({ ...formData, destacado: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? "Salvando..." : service ? "Atualizar Serviço" : "Cadastrar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

