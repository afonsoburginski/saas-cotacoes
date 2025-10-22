import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AssinaturaSkeleton() {
  return (
    <div className="flex justify-center p-4">
      <Card className="max-w-2xl w-full @container/card shadow-lg border-gray-200/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6 items-center p-6 bg-gray-50/80 rounded-lg border">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
