export default function JobCardSkeleton() {
  return (
    <div>
      <div className="mt-7 rounded-xl bg-white p-6">
        <div className="mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="relative">
              <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
          </div>

          {/* Main Card Skeleton */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Card Header Skeleton */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="h-6 w-80 animate-pulse rounded bg-gray-300"></div>
            </div>

            {/* Employee Info Section Skeleton */}
            <div className="p-6">
              <div className="mb-8 flex items-start gap-6">
                {/* Profile Image Skeleton */}
                <div className="relative">
                  <div className="h-24 w-24 animate-pulse rounded-full border-4 border-gray-200 bg-gray-300"></div>
                </div>

                {/* Employee Details Grid Skeleton */}
                <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                  {/* Row 1 */}
                  <div className="flex items-center">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  {/* Row 4 */}
                  <div className="flex items-center">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                    <span className="mx-2 text-gray-400">:</span>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid Skeleton */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Present Days Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 flex items-baseline gap-2">
                    <div className="h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Late Days Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Difference Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Absent Days Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Leave Days Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-10 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Approved OT Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Unpaid Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Paid Card */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 h-8 w-20 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
