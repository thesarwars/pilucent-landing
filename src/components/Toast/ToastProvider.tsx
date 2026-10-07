"use client"

import React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { Toast } from "./Toast"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  isExiting?: boolean // Add isExiting to the ToastProps interface
}

interface ToastContextType {
  toasts: ToastProps[]
  toast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true after component mounts to avoid hydration issues
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const toast = useCallback((message: string, type: ToastType = "success", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])

    if (duration !== Number.POSITIVE_INFINITY) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.map((toast) => (toast.id === id ? { ...toast, isExiting: true } : toast)))

    // Remove from state after animation completes
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 500) // Match animation duration
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      {isMounted &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[999999999999999] flex flex-col items-center gap-2 w-full max-w-md pt-4">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
                isExiting={toast.isExiting}
              />
            ))}
          </div>,
            document.getElementById("toast-root")!
        )}
    </ToastContext.Provider>
  )
}

export default function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
