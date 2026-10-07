"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ProgressBarProps {
  value: number
  variant?: "orange" | "blue"
  className?: string
  animated?: boolean
}

export function ProgressBar({ value, variant = "orange", className, animated = false }: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value, animated])

  const clampedValue = Math.min(Math.max(displayValue, 0), 100)

  return (
    <div className={cn("relative h-4 w-full rounded-[4px] overflow-hidden", className)}>
      {/* Background with diagonal stripes */}
      <div
        className={cn(
          "absolute inset-0 rounded-[4px]",
          variant === "orange"
            ? "bg-gradient-to-r from-orange-200 to-orange-300"
            : "bg-gradient-to-r from-blue-200 to-blue-300",
        )}
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            ${variant === "orange" ? "rgba(251, 146, 60, 0.7)" : "rgba(59, 130, 246, 0.9)"} 3px,
            ${variant === "orange" ? "rgba(251, 146, 60, 0.7)" : "rgba(59, 130, 246, 0.7)"} 4px
          )`,
        }}
      />

      {/* Progress fill */}
      <div
        className={cn(
          "relative h-4 rounded-[4px] transition-all duration-1000 ease-out",
          variant === "orange"
            ? "bg-gradient-to-r from-orange-600 via-orange-400 to-orange-100"
            : "bg-gradient-to-r from-blue-600 via-blue-400 to-blue-100",
        )}
        style={{ width: `${clampedValue}%` }}
      />

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 rounded-[4px] shadow-inner opacity-20" />
    </div>
  )
}
