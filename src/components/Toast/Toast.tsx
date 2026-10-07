"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { ToastType } from "@/lib/ToastService"
import { FaCheckCircle } from "react-icons/fa"
import { GoXCircleFill } from "react-icons/go"
import { AiFillExclamationCircle } from "react-icons/ai"
import { IoIosInformationCircle } from "react-icons/io"

interface ToastProps {
  id: string
  message: string
  type: ToastType
  onClose: () => void
  isExiting?: boolean
}

export function Toast({ id, message, type, onClose, isExiting }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <GoXCircleFill className="h-5 w-5 text-red-500" />
      case "warning":
        return <AiFillExclamationCircle className="h-5 w-5 text-orange-500" />
      case "info":
        return <IoIosInformationCircle className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getToastClasses = () => {
    const baseClasses =
      "flex items-center justify-between p-4 rounded-md  transform transition-all duration-300 ease-in-out w-full"

    // Animation classes
    let animationClasses = "scale-75 opacity-0"
    if (isExiting) {
      // Exit animation - slide up and fade out
      animationClasses = "scale-75 opacity-0"
    } else if (isVisible) {
      // Fully visible
      animationClasses = "scale-100 opacity-100"
    } else {
      // Initial state - above viewport and invisible
      animationClasses = "scale-75 opacity-0"
    }

    let colorClasses = ""
    switch (type) {
      case "success":
        colorClasses = "bg-white border-green-500 text-black"
        break
      case "error":
        colorClasses = "bg-white border-red-500 text-black"
        break
      case "warning":
        colorClasses = "bg-white  border-orange-500 text-black"
        break
      case "info":
        colorClasses = "bg-white  border-blue-500 text-black"
        break
      default:
        colorClasses = "bg-white  border-gray-500 text-black"
    }

    return `${baseClasses} ${colorClasses} ${animationClasses}`
  }

  return (
    <div className={getToastClasses()} style={{boxShadow: '0px 2px 7px 2px rgba(0, 0, 0, 0.3)'}}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5">{getIcon()}</div>
        <p className="text-sm font-lexend font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
