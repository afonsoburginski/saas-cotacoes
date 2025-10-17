"use client"

import { PageBackground } from "@/components/layout/page-background"
import { CategoriaAdaptive } from "@/components/categoria/categoria-adaptive"
import { useParams } from "next/navigation"

export default function CategoriaPage() {
  const params = useParams()
  const categoriaNome = decodeURIComponent(params.nome as string)

  return (
    <>
      <PageBackground />
      <CategoriaAdaptive categoriaNome={categoriaNome} />
    </>
  )
}

