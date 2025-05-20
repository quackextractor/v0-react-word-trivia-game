"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Save } from "lucide-react"

interface AvatarCreatorProps {
  onSave: (avatarData: string) => void
  color: string
}

export default function AvatarCreator({ onSave, color }: AvatarCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas and set background
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [color])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    let x, y

    if ("touches" in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.strokeStyle = "#FFFFFF"

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveAvatar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const avatarData = canvas.toDataURL("image/png")
    onSave(avatarData)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="border-2 border-white rounded-md overflow-hidden mb-2">
        <canvas
          ref={canvasRef}
          width={100}
          height={100}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none"
        />
      </div>

      <div className="flex items-center mb-2">
        <span className="text-xs mr-2">Brush Size:</span>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
          className="w-24"
        />
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Eraser className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={saveAvatar}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  )
}
