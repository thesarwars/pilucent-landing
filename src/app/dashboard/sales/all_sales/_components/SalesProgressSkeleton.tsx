"use client"

interface SalesTransactionsSkeletonProps {
  animated?: boolean
  className?: string
}

export function SalesTransactionsSkeleton({ animated = true, className = "" }: SalesTransactionsSkeletonProps) {
  const skeletonBaseClass = "bg-gray-300 rounded"
  const animatedClass = animated ? "animate-pulse" : ""

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 bg-white ${className}`}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className={`h-6 w-40 bg-gray-300 rounded animate-pulse`} />
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-28 bg-gray-300 rounded animate-pulse`}
            style={animated ? { animationDelay: "100ms" } : {}}
          />
          <div
            className={`h-4 w-4 bg-gray-300 rounded animate-pulse`}
            style={animated ? { animationDelay: "200ms" } : {}}
          />
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-5 gap-0 mb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="text-left">
            <div
              className={`h-8 w-24 mb-2 bg-gray-300 rounded animate-pulse`}
              style={animated ? { animationDelay: `${index * 100}ms` } : {}}
            />
            <div
              className={`h-4 w-20 mb-1 bg-gray-300 rounded animate-pulse`}
              style={animated ? { animationDelay: `${index * 100 + 50}ms` } : {}}
            />
            <div
              className={`h-4 w-16 bg-gray-300 rounded animate-pulse`}
              style={animated ? { animationDelay: `${index * 100 + 100}ms` } : {}}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mt-6">
        <div className="relative w-full h-[21px] overflow-hidden">
          <div className="relative flex h-full w-full">
            {/* Progress bar segments with different widths */}
            {[5, 8, 35, 45, 7].map((width, index) => (
              <div
                key={index}
                className="h-full border-r border-white last:border-r-0 relative overflow-hidden"
                style={{ width: `${width}%` }}
              >
                {animated ? (
                  // Animated version with shimmer effect
                  <div className="h-full bg-gray-200 relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
                      style={{
                        animation: "shimmer 1.5s infinite",
                        animationDelay: `${index * 200}ms`,
                      }}
                    />
                  </div>
                ) : (
                  // Static version
                  <div className="h-full bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend Skeleton */}
        <div className="flex flex-wrap gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-sm bg-gray-300  animate-pulse`}
                style={animated ? { animationDelay: `${index * 150}ms` } : {}}
              />
              <div
                className={`h-4 w-20 bg-gray-300 rounded animate-pulse`}
                style={animated ? { animationDelay: `${index * 150 + 75}ms` } : {}}
              />
            </div>
          ))}
        </div>
      </div>

    
    </div>
  )
}
