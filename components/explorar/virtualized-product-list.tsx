import { memo, useMemo } from "react"
import { ProductCardAdaptive } from "@/components/explorar/product-card-adaptive"

interface VirtualizedProductListProps {
  products: any[]
  alwaysShowButtons?: boolean
  className?: string
}

const VirtualizedProductList = memo(function VirtualizedProductList({ 
  products, 
  alwaysShowButtons = false,
  className = ""
}: VirtualizedProductListProps) {
  // Para listas pequenas (< 20 itens), renderiza normalmente
  if (products.length <= 20) {
    return (
      <div className={`flex gap-3 px-4 pb-2 ${className}`}>
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[45vw]">
            <ProductCardAdaptive product={product} alwaysShowButtons={alwaysShowButtons} />
          </div>
        ))}
      </div>
    )
  }

  // Para listas grandes, implementa virtualização simples
  // Renderiza apenas os primeiros 10 itens + indicador de "mais"
  const visibleProducts = products.slice(0, 10)
  const remainingCount = products.length - 10

  return (
    <div className={`flex gap-3 px-4 pb-2 ${className}`}>
      {visibleProducts.map((product) => (
        <div key={product.id} className="flex-none w-[45vw]">
          <ProductCardAdaptive product={product} alwaysShowButtons={alwaysShowButtons} />
        </div>
      ))}
      
      {/* Indicador de mais produtos */}
      {remainingCount > 0 && (
        <div className="flex-none w-[45vw] flex items-center justify-center">
          <div className="bg-gray-100 rounded-2xl w-full h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400 mb-2">+{remainingCount}</div>
              <div className="text-sm text-gray-500">mais produtos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export { VirtualizedProductList }
