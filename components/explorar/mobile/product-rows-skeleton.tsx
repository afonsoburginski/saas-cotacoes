import { Skeleton } from "@/components/ui/skeleton"

export function ProductRowsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Simula 3 categorias */}
      {[1, 2, 3].map((rowIndex) => (
        <div key={rowIndex} className="space-y-3">
          {/* Category title skeleton */}
          <div className="flex items-center justify-between px-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* Horizontal scrollable row skeleton */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2">
              {[1, 2, 3].map((cardIndex) => (
                <div key={cardIndex} className="flex-none w-[45vw]">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                    {/* Image skeleton */}
                    <Skeleton className="w-full h-32" />
                    
                    {/* Content skeleton */}
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-20" />
                      
                      <div className="flex gap-2 mt-3">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

