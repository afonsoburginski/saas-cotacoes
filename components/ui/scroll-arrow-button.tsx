import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { memo } from "react"

interface ScrollArrowButtonProps {
  direction: "left" | "right"
  onClick: () => void
  show: boolean
}

export const ScrollArrowButton = memo(function ScrollArrowButton({ 
  direction, 
  onClick, 
  show 
}: ScrollArrowButtonProps) {
  if (!show) return null

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={`
        absolute top-1/2 -translate-y-1/2 z-10 
        h-10 w-10 rounded-full 
        bg-white/95 hover:bg-white 
        shadow-lg border border-gray-200
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200
        ${direction === "left" ? "left-2" : "right-2"}
      `}
    >
      {direction === "left" ? (
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      ) : (
        <ChevronRight className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  )
})

