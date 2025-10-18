import { useRef, useState, useCallback, memo, ReactNode } from "react"
import { ScrollArrowButton } from "./scroll-arrow-button"

interface HorizontalScrollContainerProps {
  children: ReactNode
  className?: string
}

export const HorizontalScrollContainer = memo(function HorizontalScrollContainer({ 
  children, 
  className = "" 
}: HorizontalScrollContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const updateArrowVisibility = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 400
    const newScrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth"
    })

    setTimeout(updateArrowVisibility, 100)
  }, [updateArrowVisibility])

  return (
    <div className="relative group">
      <ScrollArrowButton 
        direction="left" 
        onClick={() => scroll("left")} 
        show={showLeftArrow} 
      />
      
      <div 
        ref={scrollContainerRef}
        onScroll={updateArrowVisibility}
        className={`overflow-x-auto scrollbar-hide ${className}`}
      >
        {children}
      </div>

      <ScrollArrowButton 
        direction="right" 
        onClick={() => scroll("right")} 
        show={showRightArrow} 
      />
    </div>
  )
})

