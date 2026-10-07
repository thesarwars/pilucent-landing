"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { FiChevronDown } from "react-icons/fi"

interface Option {
  value: string
  title: string
  subtitle?: string
}

interface CheckboxMultiSelectProps {
  options: Option[]
  value?: string[]
  onChange?: (selectedValues: string[]) => void
  placeholder?: string
  allOptionText?: string
  className?: string
  triggerText?: string
}

const CheckboxMultiSelect: React.FC<CheckboxMultiSelectProps> = ({
  options=[],
  value = [],
  onChange,
  placeholder = "Select options",
  allOptionText = "All options",
  className = "",
  triggerText,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue: string): void => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((val) => val !== optionValue)
      : [...selectedValues, optionValue]

    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  const handleSelectAll = (): void => {
    const allSelected = selectedValues.length === options?.length
    const newSelectedValues = allSelected ? [] : options?.map((option:any) => option?.uid)

    setSelectedValues(newSelectedValues)
    onChange?.(newSelectedValues)
  }

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen)
  }

  const isAllSelected = selectedValues.length === options?.length && options?.length > 0
  const isIndeterminate = selectedValues.length > 0 && selectedValues.length < options?.length

  const getDisplayText = () => {
    if (triggerText) return triggerText
    if (selectedValues.length === 0) return placeholder
    if (selectedValues.length === options?.length) return allOptionText
    if (selectedValues.length === 1) {
      const selectedOption = options?.find((opt) => opt.value === selectedValues[0])
      return selectedOption?.title || placeholder
    }
    return `${selectedValues.length} selected`
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex items-center justify-between px-4 py-2.5 border border-gray-500 rounded cursor-pointer bg-white hover:border-gray-400 transition-colors"
        onClick={toggleDropdown}
      >
        <span className="text-gray-700 text-sm">{getDisplayText()}</span>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {/* Select All Option */}
          <div
            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            onClick={handleSelectAll}
          >
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate
                }}
                onChange={() => {}} // Controlled by onClick
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
            </div>
            <span className="ml-3 text-sm text-gray-700">{allOptionText}</span>
          </div>

          {/* Individual Options */}
          {options?.map((option:any) => {
            const isSelected = selectedValues.includes(option?.uid)
            return (
              <div
                key={option?.uid}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelect(option?.uid)}
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Controlled by onClick
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  {isSelected && (
                    <svg
                      className="absolute w-3 h-3 text-white pointer-events-none"
                      style={{ left: "2px", top: "2px" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm text-gray-900">{option?.title}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CheckboxMultiSelect
