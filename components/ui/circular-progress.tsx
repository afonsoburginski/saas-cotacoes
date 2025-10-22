"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number
  strokeWidth?: number
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ className, value, strokeWidth = 8, ...props }, ref) => {
    const radius = 50 - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
      <svg
        ref={ref}
        className={cn("w-full h-full", className)}
        viewBox="0 0 100 100"
        fill="none"
        strokeWidth={strokeWidth}
        {...props}
      >
        <circle
          className="text-gray-200"
          stroke="currentColor"
          cx="50"
          cy="50"
          r={radius}
        />
        <circle
          className="text-blue-600 transition-all duration-500 ease-in-out"
          stroke="currentColor"
          cx="50"
          cy="50"
          r={radius}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { CircularProgress }
