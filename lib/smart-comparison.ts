import type { Product } from "./types"

export interface ProductSimilarity {
  product: Product
  similarityScore: number
  reasons: string[]
}

export interface ComparisonSuggestion {
  baseProduct: Product
  suggestions: ProductSimilarity[]
}

/**
 * Calcula a similaridade entre dois produtos baseado em múltiplos critérios
 */
export function calculateProductSimilarity(product1: Product, product2: Product): number {
  let score = 0
  const maxScore = 100

  // Mesmo produto = 0 (não comparar consigo mesmo)
  if (product1.id === product2.id) return 0

  // Mesma categoria = 40 pontos
  if (product1.categoria === product2.categoria) {
    score += 40
  }

  // Nomes similares = até 25 pontos
  const nameScore = calculateNameSimilarity(product1.nome, product2.nome)
  score += nameScore * 0.25

  // Faixa de preço similar = até 20 pontos
  const priceScore = calculatePriceSimilarity(product1.preco, product2.preco)
  score += priceScore * 0.2

  // Rating similar = até 10 pontos
  const ratingScore = calculateRatingSimilarity(product1.rating, product2.rating)
  score += ratingScore * 0.1

  // Lojas diferentes (para comparação) = 5 pontos bonus
  if (product1.storeId !== product2.storeId) {
    score += 5
  }

  return Math.min(score, maxScore)
}

/**
 * Calcula similaridade entre nomes de produtos
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const words1 = name1.toLowerCase().split(/\s+/)
  const words2 = name2.toLowerCase().split(/\s+/)

  let commonWords = 0
  const totalWords = Math.max(words1.length, words2.length)

  words1.forEach((word1) => {
    if (words2.some((word2) => word2.includes(word1) || word1.includes(word2))) {
      commonWords++
    }
  })

  return (commonWords / totalWords) * 100
}

/**
 * Calcula similaridade entre preços (quanto mais próximos, maior a pontuação)
 */
function calculatePriceSimilarity(price1: number, price2: number): number {
  const maxPrice = Math.max(price1, price2)
  const minPrice = Math.min(price1, price2)
  const difference = maxPrice - minPrice
  const percentageDiff = (difference / maxPrice) * 100

  // Quanto menor a diferença percentual, maior a pontuação
  return Math.max(0, 100 - percentageDiff)
}

/**
 * Calcula similaridade entre ratings
 */
function calculateRatingSimilarity(rating1: number, rating2: number): number {
  const difference = Math.abs(rating1 - rating2)
  return Math.max(0, ((5 - difference) / 5) * 100)
}

/**
 * Encontra produtos similares para comparação automática
 */
export function findSimilarProducts(
  baseProduct: Product,
  allProducts: Product[],
  maxSuggestions = 3,
): ProductSimilarity[] {
  const similarities: ProductSimilarity[] = []

  allProducts.forEach((product) => {
    if (product.id === baseProduct.id || !product.ativo) return

    const score = calculateProductSimilarity(baseProduct, product)

    if (score > 30) {
      // Threshold mínimo de similaridade
      const reasons = generateSimilarityReasons(baseProduct, product, score)
      similarities.push({
        product,
        similarityScore: score,
        reasons,
      })
    }
  })

  // Ordena por score de similaridade (maior primeiro)
  similarities.sort((a, b) => b.similarityScore - a.similarityScore)

  return similarities.slice(0, maxSuggestions)
}

/**
 * Gera razões explicativas para a similaridade
 */
function generateSimilarityReasons(product1: Product, product2: Product, score: number): string[] {
  const reasons: string[] = []

  if (product1.categoria === product2.categoria) {
    reasons.push(`Mesma categoria: ${product1.categoria}`)
  }

  const nameScore = calculateNameSimilarity(product1.nome, product2.nome)
  if (nameScore > 50) {
    reasons.push("Produto similar")
  }

  const priceDiff = Math.abs(product1.preco - product2.preco)
  const avgPrice = (product1.preco + product2.preco) / 2
  const priceDiffPercent = (priceDiff / avgPrice) * 100

  if (priceDiffPercent < 20) {
    reasons.push("Preço similar")
  } else if (product2.preco < product1.preco) {
    reasons.push("Opção mais barata")
  } else {
    reasons.push("Opção premium")
  }

  if (product1.storeId !== product2.storeId) {
    reasons.push("Loja diferente")
  }

  if (Math.abs(product1.rating - product2.rating) < 0.5) {
    reasons.push("Avaliação similar")
  }

  return reasons
}

/**
 * Gera sugestões de comparação para múltiplos produtos
 */
export function generateComparisonSuggestions(products: Product[], allProducts: Product[]): ComparisonSuggestion[] {
  return products.map((product) => ({
    baseProduct: product,
    suggestions: findSimilarProducts(product, allProducts),
  }))
}

/**
 * Encontra os melhores produtos para comparação automática baseado em uma categoria
 */
export function findBestProductsForCategory(categoria: string, allProducts: Product[], maxProducts = 4): Product[] {
  const categoryProducts = allProducts.filter((p) => p.categoria === categoria && p.ativo)

  // Agrupa por nome similar para pegar diferentes lojas do mesmo produto
  const productGroups = new Map<string, Product[]>()

  categoryProducts.forEach((product) => {
    const baseKey = product.nome
      .toLowerCase()
      .replace(/\d+kg|\d+mm|\d+cm|\d+m³|\d+l/g, "") // Remove medidas
      .replace(/\s+/g, " ")
      .trim()

    if (!productGroups.has(baseKey)) {
      productGroups.set(baseKey, [])
    }
    productGroups.get(baseKey)!.push(product)
  })

  // Seleciona os melhores produtos de cada grupo
  const selectedProducts: Product[] = []

  Array.from(productGroups.values()).forEach((group) => {
    if (selectedProducts.length >= maxProducts) return

    // Ordena por rating e priority score da loja
    group.sort((a, b) => {
      const aStore = allProducts.find((p) => p.storeId === a.storeId)
      const bStore = allProducts.find((p) => p.storeId === b.storeId)
      return b.rating * 0.7 - a.rating * 0.7
    })

    // Adiciona até 2 produtos do mesmo grupo (diferentes lojas)
    selectedProducts.push(...group.slice(0, 2))
  })

  return selectedProducts.slice(0, maxProducts)
}
