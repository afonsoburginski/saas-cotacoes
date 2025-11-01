"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, X, Clock, Calendar as CalendarIcon, Play, Square, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface StoreAdvertisementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: number
  storeName?: string
}

interface AdvertisementData {
  images: string[]
  startDate: string
  endDate: string
  active: boolean
  link: string
}

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export function StoreAdvertisementDialog({
  open,
  onOpenChange,
  storeId,
  storeName,
}: StoreAdvertisementDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [data, setData] = React.useState<AdvertisementData>({
    images: [],
    startDate: '',
    endDate: '',
    active: true,
    link: '',
  })

  // Atualizar tempo atual a cada segundo para o time tracker
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Buscar dados existentes quando o dialog abrir
  React.useEffect(() => {
    if (open && storeId) {
      fetchAdvertisement()
    } else {
      // Resetar dados quando fechar
      setDateRange({
        from: undefined,
        to: undefined,
      })
      setData({
        images: [],
        startDate: '',
        endDate: '',
        active: true,
        link: '',
      })
    }
  }, [open, storeId])

  const fetchAdvertisement = async () => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/advertisements`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          const startDate = result.data.startDate ? new Date(result.data.startDate) : undefined
          const endDate = result.data.endDate ? new Date(result.data.endDate) : undefined
          
          setDateRange({
            from: startDate,
            to: endDate,
          })
          
          setData({
            images: result.images || [],
            startDate: startDate ? startDate.toISOString().slice(0, 16) : '',
            endDate: endDate ? endDate.toISOString().slice(0, 16) : '',
            active: result.data.active ?? true,
            link: result.data.link || '',
          })
        } else {
          // Não há publicidade ainda, manter valores padrão
          setDateRange({
            from: undefined,
            to: undefined,
          })
          setData({
            images: [],
            startDate: '',
            endDate: '',
            active: true,
            link: '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching advertisement:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar publicidade',
        variant: 'destructive',
      })
    } finally {
      setIsFetching(false)
    }
  }

  // Atualizar startDate e endDate quando dateRange mudar
  React.useEffect(() => {
    if (dateRange.from) {
      setData(prev => ({
        ...prev,
        startDate: dateRange.from!.toISOString().slice(0, 16)
      }))
    } else {
      setData(prev => ({ ...prev, startDate: '' }))
    }
    
    if (dateRange.to) {
      setData(prev => ({
        ...prev,
        endDate: dateRange.to!.toISOString().slice(0, 16)
      }))
    } else {
      setData(prev => ({ ...prev, endDate: '' }))
    }
  }, [dateRange])

  const handleSave = async () => {
    if (!storeId) return

    setIsLoading(true)
    try {
      const payload = {
        images: data.images,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        active: data.active,
        link: data.link || null,
      }

      const response = await fetch(`/api/admin/stores/${storeId}/advertisements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Publicidade salva com sucesso!',
        })
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao salvar publicidade',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving advertisement:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar publicidade',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular time tracker
  const getTimeTracker = () => {
    const now = currentTime.getTime()
    const start = dateRange.from ? dateRange.from.getTime() : null
    const end = dateRange.to ? dateRange.to.getTime() : null

    if (!start && !end) {
      return { status: 'no-dates', message: 'Sem datas definidas' }
    }

    if (start && now < start) {
      const diff = start - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return {
        status: 'waiting',
        message: `Inicia em ${days}d ${hours}h ${minutes}m`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    }

    if (end && now < end) {
      const diff = end - now
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return {
        status: 'active',
        message: `Termina em ${days}d ${hours}h ${minutes}m`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    }

    if (end && now >= end) {
      return {
        status: 'ended',
        message: 'Publicidade encerrada',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    }

    return {
      status: 'active-no-end',
      message: 'Em exibição (sem data de término)',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }

  const tracker = getTimeTracker()

  // Formatar data para exibição
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Publicidade</h2>
            <p className="text-sm text-gray-600 mt-1">
              {storeName && `Adicione imagens de publicidade para ${storeName}`}
              {!storeName && 'Adicione imagens de publicidade para esta loja'}
            </p>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload de Imagens */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Imagens de Publicidade</Label>
                  <Badge variant="outline">{data.images.length}/10</Badge>
                </div>
                <ImageUpload
                  value={data.images}
                  onChange={(urls) => setData({ ...data, images: urls })}
                  maxImages={10}
                  bucket="images"
                  pathPrefix={`stores/${storeId}/advertisements`}
                />
                <p className="text-sm text-gray-500">
                  Adicione até 10 imagens que serão exibidas como publicidade no site
                </p>
              </div>

              {/* Seção de Datas e Time Tracker */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <Label className="text-base font-semibold">Período de Exibição (Opcional)</Label>
                </div>

                {/* Grid: Date Range e Time Tracker lado a lado */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                  {/* Date Range Picker - Ocupa 2 colunas */}
                  <div className="lg:col-span-2 space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-left font-normal bg-white"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                            )
                          ) : (
                            <span className="text-gray-500">Selecione o período de exibição</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: dateRange.from, to: dateRange.to }}
                          onSelect={(range) => {
                            setDateRange({
                              from: range?.from,
                              to: range?.to,
                            })
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    {(dateRange.from || dateRange.to) && (
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {dateRange.from && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Início:</span>
                            <Input
                              type="time"
                              value={dateRange.from ? new Date(dateRange.from).toTimeString().slice(0, 5) : ''}
                              onChange={(e) => {
                                if (dateRange.from && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':')
                                  const newDate = new Date(dateRange.from)
                                  newDate.setHours(parseInt(hours), parseInt(minutes))
                                  setDateRange(prev => ({ ...prev, from: newDate }))
                                }
                              }}
                              className="h-7 w-24 text-xs"
                            />
                          </div>
                        )}
                        {dateRange.to && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Fim:</span>
                            <Input
                              type="time"
                              value={dateRange.to ? new Date(dateRange.to).toTimeString().slice(0, 5) : ''}
                              onChange={(e) => {
                                if (dateRange.to && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':')
                                  const newDate = new Date(dateRange.to)
                                  newDate.setHours(parseInt(hours), parseInt(minutes))
                                  setDateRange(prev => ({ ...prev, to: newDate }))
                                }
                              }}
                              className="h-7 w-24 text-xs"
                            />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700"
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          Limpar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Time Tracker - Altura igual ao input, alinhado na base */}
                  {(dateRange.from || dateRange.to) ? (
                    <div className={`rounded-md border ${tracker.borderColor} ${tracker.bgColor} px-2 h-10 flex items-center`}>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {tracker.status === 'waiting' && <Clock className={`h-3 w-3 ${tracker.color} shrink-0`} />}
                        {tracker.status === 'active' && <Play className={`h-3 w-3 ${tracker.color} shrink-0`} />}
                        {tracker.status === 'active-no-end' && <CheckCircle2 className={`h-3 w-3 ${tracker.color} shrink-0`} />}
                        {tracker.status === 'ended' && <Square className={`h-3 w-3 ${tracker.color} shrink-0`} />}
                        <p className={`font-medium text-xs ${tracker.color} truncate`}>{tracker.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-2 h-10 flex items-center justify-center">
                      <p className="text-[10px] text-gray-400">
                        Defina o período
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Link Opcional */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-sm font-medium text-gray-700">
                  Link Opcional (Opcional)
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={data.link}
                  onChange={(e) => setData({ ...data, link: e.target.value })}
                  className="bg-white"
                />
                <p className="text-xs text-gray-500">
                  Se informado, o banner inteiro será clicável e redirecionará para este link. 
                  Caso contrário, o nome da loja redireciona para o perfil do fornecedor.
                </p>
              </div>

              {/* Status Ativo */}
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50/50">
                <Checkbox
                  id="active"
                  checked={data.active}
                  onCheckedChange={(checked) => 
                    setData({ ...data, active: checked === true })
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="active" className="font-semibold cursor-pointer block mb-1">
                    Publicidade Ativa
                  </Label>
                  <p className="text-sm text-gray-600">
                    Desative para ocultar temporariamente a publicidade sem removê-la. 
                    Isso não remove as imagens ou datas configuradas.
                  </p>
                </div>
                <Badge variant={data.active ? "default" : "secondary"}>
                  {data.active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isFetching}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

