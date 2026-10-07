type ToastType = "success" | "error" | "info" | "warning"

interface ToastOptions {
  type?: ToastType
  duration?: number
}

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
  isExiting?: boolean
}

// Create a custom event for toast communication
const TOAST_EVENT = "CUSTOM_TOAST_EVENT"

class ToastService {
  // Create a toast with default type
  toast(message: string, options: ToastOptions = {}) {
    const { type = "default", duration = 5000 } = options

    const id = Math.random().toString(36).substring(2, 9)

    // Dispatch custom event that will be caught by the ToastContainer
    const event = new CustomEvent(TOAST_EVENT, {
      detail: {
        id,
        message,
        type,
        duration,
      },
    })

    window.dispatchEvent(event)

    return id
  }

  // Success toast shorthand
  success(message: string, options: Omit<ToastOptions, "type"> = {}) {
    return this.toast(message, { ...options, type: "success" })
  }

  // Error toast shorthand
  error(message: string, options: Omit<ToastOptions, "type"> = {}) {
    return this.toast(message, { ...options, type: "error" })
  }

  // Warning toast shorthand
  warning(message: string, options: Omit<ToastOptions, "type"> = {}) {
    return this.toast(message, { ...options, type: "warning" })
  }

  // Info toast shorthand
  info(message: string, options: Omit<ToastOptions, "type"> = {}) {
    return this.toast(message, { ...options, type: "info" })
  }

  // Remove a specific toast by ID
  dismiss(id: string) {
    const event = new CustomEvent("DISMISS_TOAST_EVENT", {
      detail: { id },
    })

    window.dispatchEvent(event)
  }

  // Clear all toasts
  dismissAll() {
    const event = new CustomEvent("DISMISS_ALL_TOASTS_EVENT")
    window.dispatchEvent(event)
  }
}

// Create a singleton instance
export const toast = new ToastService()

// Export the types for use elsewhere
export type { ToastType, ToastOptions, ToastItem }
