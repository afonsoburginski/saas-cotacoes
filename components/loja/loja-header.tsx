import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function LojaHeader({ storeName, title }: { storeName?: string | null, title: string }) {
  return (
    <header className="flex h-10 shrink-0 items-center border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-2.5 lg:px-4">
        <SidebarTrigger className="-ml-0.5" />
        <nav aria-label="Breadcrumb" className="flex items-center">
          <ol className="flex items-center gap-1 text-sm sm:text-[15px] font-medium">
            {storeName && (
              <li className="text-muted-foreground">
                <span className="truncate max-w-[160px] inline-block align-middle">{storeName}</span>
              </li>
            )}
            {storeName && (
              <li aria-hidden>
                <span className="px-1 text-muted-foreground">/</span>
              </li>
            )}
            <li className="text-foreground">
              <span className="truncate max-w-[220px] inline-block align-middle">{title}</span>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  )
}

