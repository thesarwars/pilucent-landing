"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressSegment {
  value: number;
  color: "orange" | "cyan" | "purple" | "lavender" | "blue" | "green" | "red";
  label?: string;
}

interface SegmentedProgressBarProps {
  segments: ProgressSegment[];
  className?: string;
  animated?: boolean;
  showStripes?: boolean;
  height?: "sm" | "md" | "lg";
}

const colorVariants = {
  // orange: "bg-gradient-to-r from-orange-600 via-orange-400 to-orange-300",
  orange: "bg-[#F5886A]",
  // cyan: "bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300",
  cyan: "bg-[#56BADA]",
  // purple: "bg-gradient-to-r from-purple-600 via-purple-400 to-purple-300",
  purple: "bg-[#9B88F9]",
  lavender: "bg-[#9B88F9]",
  blue: "bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300",
  green: "bg-gradient-to-r from-green-600 via-green-400 to-green-300",
  red: "bg-gradient-to-r from-red-600 via-red-400 to-red-300",
};

const stripeColors = {
  orange: "rgba(251, 146, 60, 0.3)",
  cyan: "rgba(34, 211, 238, 0.3)",
  purple: "rgba(168, 85, 247, 0.3)",
  lavender: "rgba(196, 181, 253, 0.3)",
  blue: "rgba(59, 130, 246, 0.3)",
  green: "rgba(34, 197, 94, 0.3)",
  red: "rgba(239, 68, 68, 0.3)",
};

const heightVariants = {
  sm: "h-2",
  md: "h-4",
  lg: "h-[21px]",
};

export function SegmentedProgressBar({
  segments,
  className,
  animated = false,
  showStripes = true,
  height = "md",
}: SegmentedProgressBarProps) {
  const [displaySegments, setDisplaySegments] = useState(
    animated ? segments.map((s) => ({ ...s, value: 0 })) : segments,
  );

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplaySegments(segments);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [segments, animated]);

  // Calculate total value and percentages
  const totalValue = displaySegments.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );
  const maxValue = 100; // Assuming 100 is the maximum
  const remainingValue = Math.max(0, maxValue - totalValue);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        heightVariants[height],
        className,
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />

      {/* Segments */}
      <div className="relative flex h-full">
        {displaySegments.map((segment, index) => {
          const percentage = (segment.value / maxValue) * 100;
          return (
            <div
              key={index}
              className={cn(
                "rounded-y-lg relative border border-r-0 transition-all duration-1000 ease-out",
                segment.color,
              )}
              style={{ width: `${percentage}%` }}
            >
              {/* Segment content */}
              <div className="absolute inset-0" />

              {/* Inner shadow for depth */}
              <div className="absolute inset-0 opacity-20 shadow-inner" />
            </div>
          );
        })}

        {/* Remaining/unfilled area with stripes */}
        {remainingValue > 0 && showStripes && (
          <div
            className="relative bg-white"
            style={{
              width: `${(remainingValue / maxValue) * 100}%`,
              backgroundImage: `repeating-linear-gradient(
  -45deg,
  transparent,
  transparent 2px,
  rgba(74, 141, 246, 0.7) 3px,
  rgba(74, 141, 246, 0.7) 4px
)`,
            }}
          />
        )}
      </div>

      {/* Outer subtle shadow */}
      <div className="absolute inset-0 rounded-lg opacity-10 shadow-inner" />
    </div>
  );
}

// Simple single-segment progress bar (your original example enhanced)
interface SimpleProgressBarProps {
  value: number;
  variant?: "orange" | "blue" | "cyan" | "purple" | "green";
  className?: string;
  animated?: boolean;
  showStripes?: boolean;
  height?: "sm" | "md" | "lg";
}

export function SimpleProgressBar({
  value,
  variant = "orange",
  className,
  animated = false,
  showStripes = true,
  height = "md",
}: SimpleProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, animated]);

  const clampedValue = Math.min(Math.max(displayValue, 0), 100);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        heightVariants[height],
        className,
      )}
    >
      {/* Background with diagonal stripes */}
      {showStripes && (
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-gray-700"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              ${stripeColors[variant] || stripeColors.orange} 4px,
              ${stripeColors[variant] || stripeColors.orange} 8px
            )`,
          }}
        />
      )}

      {/* Progress fill */}
      <div
        className={cn(
          "relative rounded-lg transition-all duration-1000 ease-out",
          colorVariants[variant] || colorVariants.orange,
          heightVariants[height],
        )}
        style={{ width: `${clampedValue}%` }}
      />

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 rounded-lg opacity-20 shadow-inner" />
    </div>
  );
}
