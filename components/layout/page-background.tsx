"use client"

import { cn } from "@/lib/utils"

interface PageBackgroundProps {
  className?: string
}

export function PageBackground({ className }: PageBackgroundProps) {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden bg-white", className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-white to-gray-50/20" />

      {/* Very subtle blobs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-50/30 blur-3xl" />
      <div className="absolute -top-20 right-0 w-[700px] h-[700px] rounded-full bg-green-50/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-[650px] h-[650px] rounded-full bg-blue-50/20 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 w-[550px] h-[550px] rounded-full bg-green-50/25 blur-3xl" />
    </div>
  )
}


