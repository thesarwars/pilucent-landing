"use client"
import { FaRegCreditCard } from "react-icons/fa"
import { RiBankFill } from "react-icons/ri"

interface CardSkeletonProps {
  kind?: "card" | "bank"
}

export default function CardSkeleton({ kind = "card" }: CardSkeletonProps) {
  return (
    <div className="w-[350px] rounded-xl bg-[#EBF4FD] border">
      {/* Header section */}
      <div className="bg-gray-200 animate-pulse z-[10] flex flex-col justify-between rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            {kind === "card" ? (
              <div className="rounded-full bg-gray-300 p-2">
                <FaRegCreditCard className="text-2xl text-gray-100" />
              </div>
            ) : (
              <div className="rounded-full bg-gray-300 p-2">
                <RiBankFill className="text-2xl text-gray-100" />
              </div>
            )}
            <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
          </div>
          <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-24 bg-gray-300 rounded-md"></div>
            <div className="h-4 w-28 bg-gray-300 rounded-md"></div>
          </div>
          <div className="h-4 w-36 bg-gray-300 rounded-md"></div>
        </div>
      </div>

      {/* Footer section */}
      <div className="flex items-end justify-between p-4">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-24 bg-gray-300 rounded-md animate-pulse"></div>
          <div className="h-4 w-28 bg-gray-300 rounded-md animate-pulse"></div>
        </div>
        <div className="h-6 w-20 bg-gray-300 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}
