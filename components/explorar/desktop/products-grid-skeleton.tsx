import { Skeleton } from "@/components/ui/skeleton"

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

