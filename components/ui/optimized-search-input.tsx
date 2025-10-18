import { memo, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface OptimizedSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const OptimizedSearchInput = memo(forwardRef<HTMLInputElement, OptimizedSearchInputProps>(
  function OptimizedSearchInput({ value, onChange, placeholder = "Buscar...", className }, ref) {
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 z-10" />
        <Input
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      </div>
    )
  }
))

export { OptimizedSearchInput }
