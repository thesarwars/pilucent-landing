"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

export interface ProgressSegment {
  param?:string,
  value: number
  color: "orange" | "cyan" | "purple" | "lavender" | "blue" | "green" | "red"
  label?: string
  actualValue?: number
  amount?: string
}

interface SegmentedProgressBarProps {
  segments: ProgressSegment[]
  className?: string
  animated?: boolean
  showStripes?: boolean
  height?: "sm" | "md" | "lg"
}

const colorVariants = {
  orange: "bg-gradient-to-r from-orange-700 to-orange-500",
  cyan: "bg-gradient-to-r from-cyan-500 to-cyan-400",
  purple: "bg-gradient-to-r from-purple-500 to-purple-400",
  lavender: "bg-gradient-to-r from-purple-600 to-purple-300",
  blue: "bg-gradient-to-r from-blue-500 to-blue-400",
  green: "bg-gradient-to-r from-green-600 to-green-400",
  red: "bg-gradient-to-r from-red-500 to-red-400",
}

const heightVariants = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
}

export function SegmentedProgressBar({
  segments,
  className,
  animated = true,
  showStripes = true,
  height = "md",
}: SegmentedProgressBarProps) {
  const [displaySegments, setDisplaySegments] = useState(
    animated ? segments.map((s) => ({ ...s, value: 0 })) : segments,
  )
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplaySegments(segments)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [segments, animated])

  const totalAmount = segments.reduce((sum, segment) => sum + (segment.actualValue || 0), 0)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative">
        <div className={cn("relative w-full overflow-visible", heightVariants[height], className)}>
          {/* Segments */}
          <div className="relative flex h-full w-full">
            {displaySegments.map((segment, index) => {
              const isHovered = hoveredIndex === index
              const percentage = totalAmount > 0 ? ((segment.actualValue || 0) / totalAmount) * 100 : 0

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                    onClick={()=> segment?.param && router.push(`/dashboard/sales/all_sales?sale_type=${segment?.param}`)}
                      className={cn(
                        "relative border-r border-white rounded-md last:border-r-0 cursor-pointer transition-all duration-300 ease-out",
                        colorVariants[segment.color],
                        segment.actualValue === 0 ? "opacity-40 hover:opacity-60" : "opacity-100",
                        "hover:scale-y-150 hover:z-10 hover:shadow-lg",
                      )}
                      style={{
                        width: `${segment.value < 4 ? 4 : segment?.value}%`,
                        transformOrigin: "bottom",
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="absolute inset-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-white border border-gray-200 shadow-xl p-4 min-w-[200px] max-w-[300px]"
                    sideOffset={10}
                  >
                    <div className="space-y-2">
                      {/* Color indicator and label */}
                      <div className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full", colorVariants[segment.color])} />
                        <span className="font-medium text-accent_soft_black text-sm">{segment.label}</span>
                      </div>

                      {/* Amount */}
                      <div className="text-2xl font-bold text-accent_soft_black">
                        {segment.amount || `$${(segment.actualValue || 0).toLocaleString()}`}
                      </div>

                      {/* Percentage */}
                      <div className="text-sm text-gray-500">
                        {`${(segment.value || 0).toFixed(1)}% of total`
                         }
                      </div>

                      {/* Additional info for zero amounts */}
               
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
