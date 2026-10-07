"use client"

import { useEffect, useRef, useState } from "react"
import { FiChevronDown } from "react-icons/fi"

type DropdownProps = {
  options: any[]
  value: any
  setValue?: any
  placeholder?: string
}

const Dropdown = ({ options, value, setValue, placeholder }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<any>(undefined)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get display title from value if it's an object
  const getDisplayTitle = () => {
    if (!value) return placeholder || "Select an option"

    if (typeof value === "object" && value.title) {
      return value.title
    }

    // If value is a string (like "column1"), find the matching option
    const matchingOption = options.find((option) => option.value === value)
    return matchingOption ? matchingOption.title : value
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex cursor-pointer items-center justify-between rounded border border-gray-300 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-800">{getDisplayTitle()}</span>
        <FiChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded border border-gray-300 bg-white shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <div
              key={index}
              className={`cursor-pointer p-2 hover:bg-gray-100 ${
                (typeof value === "object" && value?.value === option.value) ||
                (typeof value === "string" && value === option.value)
                  ? "bg-gray-50"
                  : ""
              }`}
              onClick={() => {
                setValue && setValue(option)
                setIsOpen(false)
              }}
            >
              {option.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
