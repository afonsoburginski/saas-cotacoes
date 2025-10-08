import type * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "glass-input flex h-10 w-full min-w-0 rounded-lg px-4 py-2 text-base text-foreground",
        "shadow-lg transition-all duration-300 outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-primary/40 focus:shadow-xl focus:ring-4 focus:ring-primary/20",
        "hover:border-primary/30 hover:shadow-lg",
        "md:text-sm illuminate-soft",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
