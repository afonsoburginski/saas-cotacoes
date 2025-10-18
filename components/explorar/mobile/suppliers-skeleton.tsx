import { Skeleton } from "@/components/ui/skeleton"

export function SuppliersSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <div key={index} className="">
          {/* Supplier info skeleton */}
          <div className="px-4 py-3 bg-gray-50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-3 mb-3 px-4">
              <div className="border-t border-gray-200 w-full" />
            </div>
          </div>
          
          {/* Products row skeleton */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2">
              {[1, 2, 3].map((cardIndex) => (
                <div key={cardIndex} className="flex-none w-[45vw]">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                    <Skeleton className="w-full h-32" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
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

