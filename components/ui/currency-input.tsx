"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

const formatCurrency = (value: string | number) => {
  let numericValue = 0
  if (typeof value === 'string') {
    numericValue = parseFloat(value.replace(/[^0-9]/g, '')) / 100
  } else {
    numericValue = value
  }
  
  if (isNaN(numericValue)) return ''
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue)
}

const parseCurrency = (value: string): number | undefined => {
  const num = parseFloat(value.replace(/[^0-9]/g, '')) / 100
  return isNaN(num) ? undefined : num
}

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: number | undefined | null
  onValueChange: (value: number | undefined) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(value ? formatCurrency(value) : '')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^0-9]/g, '')
      const numericValue = rawValue ? parseInt(rawValue, 10) / 100 : undefined
      
      const formatted = numericValue !== undefined ? formatCurrency(numericValue) : ''
      setDisplayValue(formatted)
      onValueChange(numericValue)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // On blur, ensure it's correctly formatted if needed.
      const numericValue = parseCurrency(e.target.value)
      if (numericValue !== undefined) {
        setDisplayValue(formatCurrency(numericValue))
      }
    }
    
    // Update display value when the external value prop changes
    React.useEffect(() => {
      const currentValue = value !== null && value !== undefined ? value : undefined
      const displayNumericValue = parseCurrency(displayValue)
      
      if (currentValue !== displayNumericValue) {
        setDisplayValue(currentValue !== undefined ? formatCurrency(currentValue) : '')
      }
    }, [value, displayValue])

    return (
      <Input
        ref={ref}
        {...props}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="R$ 0,00"
        type="text" // Garante que a máscara funcione
      />
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
