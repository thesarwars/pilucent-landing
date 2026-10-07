"use client"

import { useEffect, useState } from "react"

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time - you can adjust this or tie it to actual loading events
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="">
      <div className="flex gap-1">
        {[...Array(7)].map((_, index) => (
          <div
            key={index}
            className="w-1 h-10 bg-accent_soft_black animate-pulse"
            style={{
              animation: `preloaderAnim 1.2s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes preloaderAnim {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Preloader
