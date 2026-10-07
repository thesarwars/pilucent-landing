"use client"
import type React from "react"
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
interface SignaturePadProps {
  onEnd: (data: string) => void
}
const SignaturePad = forwardRef<{ clear: () => void }, SignaturePadProps>(({ onEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const isDrawing = useRef(false)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * 2
    canvas.height = 200 * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = "200px"
    // Get context
    const context = canvas.getContext("2d")
    if (!context) return
    // Set context properties
    context.scale(2, 2)
    context.lineCap = "round"
    context.strokeStyle = "black"
    context.lineWidth = 2
    contextRef.current = context
    // Handle window resize
    const handleResize = () => {
      if (!canvas || !context) return
      // Save current drawing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // Resize canvas
      canvas.width = canvas.offsetWidth * 2
      canvas.style.width = `${canvas.offsetWidth}px`
      // Restore context properties
      context.scale(2, 2)
      context.lineCap = "round"
      context.strokeStyle = "black"
      context.lineWidth = 2
      // Restore drawing
      context.putImageData(imageData, 0, 0)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true
    const { offsetX, offsetY } = getCoordinates(e)
    contextRef.current?.beginPath()
    contextRef.current?.moveTo(offsetX, offsetY)
  }
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const { offsetX, offsetY } = getCoordinates(e)
    contextRef.current?.lineTo(offsetX, offsetY)
    contextRef.current?.stroke()
  }
  const endDrawing = () => {
    isDrawing.current = false
    if (canvasRef.current) {
      onEnd(canvasRef.current.toDataURL())
    }
  }
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e.nativeEvent instanceof MouseEvent) {
      const rect = canvasRef.current?.getBoundingClientRect()
      return {
        offsetX: e.nativeEvent.clientX - (rect?.left || 0),
        offsetY: e.nativeEvent.clientY - (rect?.top || 0),
      }
    } else if (e.nativeEvent instanceof TouchEvent) {
      const rect = canvasRef.current?.getBoundingClientRect()
      const touch = e.nativeEvent.touches[0] || e.nativeEvent.changedTouches[0]
      return {
        offsetX: touch.clientX - (rect?.left || 0),
        offsetY: touch.clientY - (rect?.top || 0),
      }
    }
    return { offsetX: 0, offsetY: 0 }
  }
  const clear = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      onEnd("")
    }
  }
  useImperativeHandle(ref, () => ({
    clear,
  }))
  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
      className="w-full touch-none"
    />
  )
})
SignaturePad.displayName = "SignaturePad"
export default SignaturePad