"use client";

import { ToastItem } from "@/lib/ToastService";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";

interface ToastContainerProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const positionClasses = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

export function ToastContainer({
  position = "top-center",
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Listen for toast events
    const handleToast = (event: CustomEvent<ToastItem>) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      if (newToast.duration !== 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration);
      }
    };

    // Listen for dismiss events
    const handleDismiss = (event: CustomEvent<{ id: string }>) => {
      removeToast(event.detail.id);
    };

    // Listen for dismiss all events
    const handleDismissAll = () => {
      setToasts((prevToasts) =>
        prevToasts.map((toast) => ({ ...toast, isExiting: true })),
      );

      setTimeout(() => {
        setToasts([]);
      }, 500);
    };

    // Add event listeners
    window.addEventListener("CUSTOM_TOAST_EVENT", handleToast as EventListener);
    window.addEventListener(
      "DISMISS_TOAST_EVENT",
      handleDismiss as EventListener,
    );
    window.addEventListener(
      "DISMISS_ALL_TOASTS_EVENT",
      handleDismissAll as EventListener,
    );

    // Clean up event listeners
    return () => {
      window.removeEventListener(
        "CUSTOM_TOAST_EVENT",
        handleToast as EventListener,
      );
      window.removeEventListener(
        "DISMISS_TOAST_EVENT",
        handleDismiss as EventListener,
      );
      window.removeEventListener(
        "DISMISS_ALL_TOASTS_EVENT",
        handleDismissAll as EventListener,
      );
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast,
      ),
    );

    // Remove from state after animation completes
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 500); // Match animation duration
  };

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed top-0 left-1/2 font-poppins -translate-x-1/2 z-[99999999999999] flex flex-col items-center gap-2 w-full max-w-md pt-4 px-2 ${positionClasses[position]}`}
      // style={{ maxWidth: "calc(100% - 2rem)" }}
    >
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
    document.getElementById("toast-root")!,
  );
}
