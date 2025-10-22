import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronRight } from "lucide-react"

export function LojaHeader({ storeName, title }: { storeName?: string | null, title: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4"
        />
        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
          {storeName && (
            <>
              <span className="text-muted-foreground">{storeName}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          <span>{title}</span>
        </div>
      </div>
    </header>
  )
}

