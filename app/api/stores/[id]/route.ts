import { NextResponse } from 'next/server'
import { db } from '@/drizzle'
import { stores } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, parseInt(params.id)))
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }
    
    let servicesOffered: Array<{ label: string; icon?: string }> | undefined
    try {
      if (store.shippingPolicy) {
        const parsed = typeof store.shippingPolicy === 'string' 
          ? JSON.parse(store.shippingPolicy) 
          : (store.shippingPolicy as any)
        if (parsed && Array.isArray(parsed.servicesOffered)) {
          servicesOffered = parsed.servicesOffered.map((item: any) => {
            if (typeof item === 'string') return { label: item }
            if (item && typeof item.label === 'string') return { label: item.label, icon: item.icon || undefined }
            return null
          }).filter(Boolean) as Array<{ label: string; icon?: string }>
        }
      }
    } catch {}

    const formatted = {
      id: store.id.toString(),
      nome: store.nome,
      email: store.email,
      telefone: store.telefone,
      cnpj: store.cnpj,
      endereco: store.endereco,
      cep: store.cep,
      rua: store.rua,
      numero: store.numero,
      complemento: store.complemento,
      bairro: store.bairro,
      cidade: store.cidade,
      estado: store.estado,
      horarioFuncionamento: store.horarioFuncionamento,
      logo: store.logo,
      coverImage: store.coverImage,
      status: store.status,
      priorityScore: store.priorityScore,
      plano: store.plano,
      createdAt: store.createdAt?.toISOString().split('T')[0],
      shippingPolicy: store.shippingPolicy,
      address: store.address,
      rating: store.rating ? parseFloat(store.rating as string) : 0,
      servicesOffered,
    }
    
    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const id = parseInt(params.id)
    const data: any = {}
    if (body.nome !== undefined) data.nome = body.nome
    if (body.email !== undefined) data.email = body.email
    if (body.telefone !== undefined) data.telefone = body.telefone
    if (body.cnpj !== undefined) data.cnpj = body.cnpj
    if (body.endereco !== undefined) data.endereco = body.endereco
    if (body.cep !== undefined) data.cep = body.cep
    if (body.rua !== undefined) data.rua = body.rua
    if (body.numero !== undefined) data.numero = body.numero
    if (body.complemento !== undefined) data.complemento = body.complemento
    if (body.bairro !== undefined) data.bairro = body.bairro
    if (body.cidade !== undefined) data.cidade = body.cidade
    if (body.estado !== undefined) data.estado = body.estado
    if (body.horarioFuncionamento !== undefined) data.horarioFuncionamento = body.horarioFuncionamento
    if (body.logo !== undefined) data.logo = body.logo
    if (body.coverImage !== undefined) data.coverImage = body.coverImage
    if (body.servicesOffered !== undefined) {
      try {
        const existingRaw: any = body.shippingPolicy ?? null
        let existing: any = {}
        if (existingRaw) {
          existing = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw
        }
        const normalized = (Array.isArray(body.servicesOffered) ? body.servicesOffered : []).map((item: any) => {
          if (typeof item === 'string') return { label: item }
          if (item && typeof item.label === 'string') return { label: item.label, icon: item.icon || undefined }
          return null
        }).filter(Boolean)
        const merged = { ...existing, servicesOffered: normalized }
        data.shippingPolicy = merged
      } catch {
        const normalized = (Array.isArray(body.servicesOffered) ? body.servicesOffered : []).map((item: any) => {
          if (typeof item === 'string') return { label: item }
          if (item && typeof item.label === 'string') return { label: item.label, icon: item.icon || undefined }
          return null
        }).filter(Boolean)
        data.shippingPolicy = { servicesOffered: normalized }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    await db.update(stores).set(data).where(eq(stores.id, id))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    )
  }
}

