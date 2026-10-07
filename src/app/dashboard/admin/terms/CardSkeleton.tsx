"use client"

export default function CardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Status indicator skeleton */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gray-200 animate-pulse" />

      <div className="px-5 py-4">
        {/* Header with title and action menu skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-1/2">
            <div className="h-6 bg-gray-200 rounded-md animate-pulse" />
          </div>

          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Details Section skeleton */}
        <div className="mt-3">
          <div className="inline-flex items-center gap-2">
            <div className="h-7 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-24 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Subtle divider */}
        <div className="my-4 border-t border-gray-100" />

        {/* Footer Section skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-16 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div>
            <div className="h-5 w-10 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
