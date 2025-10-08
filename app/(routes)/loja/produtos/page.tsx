"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/features/data-table"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { Plus, Edit, Power, Upload, Download, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function ProdutosPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState(mockProducts.filter((p) => p.storeId === "1")) // Mock store ID
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  })

  const categorias = ["Cimento", "Tijolos", "Areia", "Ferro", "Brita", "Telhas", "Tintas"]

  const handleInlineEdit = (productId: string, field: "preco" | "estoque", value: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, [field]: field === "preco" ? Number.parseFloat(value) || 0 : Number.parseInt(value) || 0 }
          : p,
      ),
    )
    toast({
      title: "Produto atualizado!",
      description: `${field === "preco" ? "Preço" : "Estoque"} atualizado com sucesso.`,
    })
  }

  const handleToggleStatus = (productId: string) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ativo: !p.ativo } : p)))
    const product = products.find((p) => p.id === productId)
    toast({
      title: product?.ativo ? "Produto desativado!" : "Produto ativado!",
      description: `O produto foi ${product?.ativo ? "desativado" : "ativado"} com sucesso.`,
    })
  }

  const handleCreateProduct = () => {
    if (!formData.nome || !formData.categoria || !formData.preco || !formData.estoque) {
      toast({
        title: "Erro!",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const newProduct: Product = {
      id: `p${Date.now()}`,
      storeId: "1",
      storeNome: "Construmax",
      nome: formData.nome,
      categoria: formData.categoria,
      preco: Number.parseFloat(formData.preco),
      estoque: Number.parseInt(formData.estoque),
      rating: 0,
      ativo: true,
    }

    setProducts((prev) => [newProduct, ...prev])
    setFormData({ nome: "", categoria: "", preco: "", estoque: "" })
    setShowCreateModal(false)
    toast({
      title: "Produto criado!",
      description: `O produto "${formData.nome}" foi adicionado com sucesso.`,
    })
  }

  const handleImportCSV = () => {
    toast({
      title: "Importação iniciada!",
      description: "O arquivo CSV está sendo processado...",
    })
  }

  const handleExportCSV = () => {
    toast({
      title: "Exportação iniciada!",
      description: "O arquivo CSV está sendo preparado para download...",
    })
  }

  const columns = [
    {
      key: "imagemUrl" as keyof Product,
      label: "Imagem",
      render: (value: string) => (
        <div className="w-12 h-12 relative bg-gray-50 rounded overflow-hidden">
          <Image src={value || "/placeholder.svg?height=48&width=48"} alt="Produto" fill className="object-cover" />
        </div>
      ),
    },
    {
      key: "nome" as keyof Product,
      label: "Nome",
      sortable: true,
    },
    {
      key: "categoria" as keyof Product,
      label: "Categoria",
      sortable: true,
      render: (value: string) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "preco" as keyof Product,
      label: "Preço",
      sortable: true,
      render: (value: number, item: Product) => (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleInlineEdit(item.id, "preco", e.target.value)}
          className="w-24 h-8"
          step="0.01"
        />
      ),
    },
    {
      key: "estoque" as keyof Product,
      label: "Estoque",
      sortable: true,
      render: (value: number, item: Product) => (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleInlineEdit(item.id, "estoque", e.target.value)}
          className="w-20 h-8"
        />
      ),
    },
    {
      key: "ativo" as keyof Product,
      label: "Status",
      render: (value: boolean, item: Product) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? "Ativo" : "Inativo"}</Badge>
      ),
    },
    {
      key: "id" as keyof Product,
      label: "Ações",
      render: (value: string, item: Product) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditingProduct(item)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(item.id)}>
            <Power className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos da sua loja</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
                <DialogDescription>Adicione um novo produto ao seu catálogo</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Cimento Portland CP II-E 50kg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData((prev) => ({ ...prev, preco: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estoque">Estoque *</Label>
                    <Input
                      id="estoque"
                      type="number"
                      value={formData.estoque}
                      onChange={(e) => setFormData((prev) => ({ ...prev, estoque: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct}>Criar Produto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nenhum produto cadastrado</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar primeiro produto
          </Button>
        </div>
      ) : (
        <DataTable data={products} columns={columns} searchPlaceholder="Buscar produtos..." />
      )}
    </div>
  )
}
