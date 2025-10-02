"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { motion, useDragControls, type PanInfo } from "framer-motion"
import { X, Minus, Square, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AppWindowProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  minSize?: { width: number; height: number }
  maxSize?: { width: number; height: number }
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  zIndex?: number
  className?: string
  color?: "cyan" | "purple" | "green" | "yellow"
  resizable?: boolean
  draggable?: boolean
}

export function AppWindow({
  id,
  title,
  icon,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  minSize = { width: 400, height: 300 },
  maxSize = { width: 1400, height: 900 },
  onClose,
  onMinimize,
  onMaximize,
  zIndex = 10,
  className,
  color = "cyan",
  resizable = true,
  draggable = true,
}: AppWindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const dragControls = useDragControls()
  const windowRef = useRef<HTMLDivElement>(null)

  const getColorClasses = () => {
    switch (color) {
      case "cyan":
        return {
          border: "border-primary/30",
          glow: "shadow-[0_0_30px_rgba(0,255,255,0.3)]",
          accent: "bg-primary",
          headerBg: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
        }
      case "purple":
        return {
          border: "border-secondary/30",
          glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
          accent: "bg-secondary",
          headerBg: "bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent",
        }
      case "green":
        return {
          border: "border-accent/30",
          glow: "shadow-[0_0_30px_rgba(34,197,94,0.3)]",
          accent: "bg-accent",
          headerBg: "bg-gradient-to-r from-accent/10 via-accent/5 to-transparent",
        }
      case "yellow":
        return {
          border: "border-chart-4/30",
          glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
          accent: "bg-chart-4",
          headerBg: "bg-gradient-to-r from-chart-4/10 via-chart-4/5 to-transparent",
        }
      default:
        return {
          border: "border-primary/30",
          glow: "shadow-[0_0_30px_rgba(0,255,255,0.3)]",
          accent: "bg-primary",
          headerBg: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
        }
    }
  }

  const colors = getColorClasses()

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false)
      setSize(initialSize)
      setPosition(initialPosition)
    } else {
      setIsMaximized(true)
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 100 })
      setPosition({ x: 20, y: 20 })
    }
    onMaximize?.()
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    onMinimize?.()
  }

  const handleClose = () => {
    onClose?.()
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    setPosition({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    })
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!resizable) return

    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height
    const startPosX = position.x
    const startPosY = position.y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startPosX
      let newY = startPosY

      if (direction.includes("e")) {
        newWidth = Math.max(minSize.width, Math.min(maxSize.width, startWidth + deltaX))
      }
      if (direction.includes("w")) {
        newWidth = Math.max(minSize.width, Math.min(maxSize.width, startWidth - deltaX))
        newX = startPosX + (startWidth - newWidth)
      }
      if (direction.includes("s")) {
        newHeight = Math.max(minSize.height, Math.min(maxSize.height, startHeight + deltaY))
      }
      if (direction.includes("n")) {
        newHeight = Math.max(minSize.height, Math.min(maxSize.height, startHeight - deltaY))
        newY = startPosY + (startHeight - newHeight)
      }

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  if (isMinimized) {
    return null
  }

  return (
    <motion.div
      ref={windowRef}
      drag={draggable && !isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: position.x,
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={{
        width: size.width,
        height: size.height,
        zIndex,
        y: position.y,
      }}
      className={cn(
        "fixed overflow-hidden rounded-2xl border-2 bg-[#0f0f1a]/95 backdrop-blur-2xl",
        colors.border,
        colors.glow,
        isDragging && "cursor-grabbing",
        isResizing && "select-none",
        className,
      )}
    >
      <div
        className={cn("relative flex h-14 items-center justify-between px-4", colors.headerBg)}
        onPointerDown={(e) => {
          if (draggable && !isMaximized) {
            dragControls.start(e)
          }
        }}
        style={{ cursor: draggable && !isMaximized ? "grab" : "default" }}
      >
        {/* Left side - Icon and Title */}
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-background/50 to-background/30 text-foreground"
              whileHover={{ scale: 1.05 }}
            >
              {icon}
            </motion.div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground">{id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMinimize}
            className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-chart-4/20 transition-colors hover:bg-chart-4/30"
          >
            <Circle className="h-3 w-3 fill-chart-4/50 text-chart-4" />
            <Minus className="absolute h-3 w-3 text-chart-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaximize}
            className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 transition-colors hover:bg-accent/30"
          >
            <Circle className="h-3 w-3 fill-accent/50 text-accent" />
            <Square className="absolute h-3 w-3 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 transition-colors hover:bg-destructive/30"
          >
            <Circle className="h-3 w-3 fill-destructive/50 text-destructive" />
            <X className="absolute h-3 w-3 text-destructive opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        </div>

        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px]", colors.accent)} />
      </div>

      {/* Window Content */}
      <div className="h-[calc(100%-56px)] overflow-auto">{children}</div>

      {resizable && !isMaximized && (
        <>
          {/* Corner Handles */}
          <div
            className={cn("absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl-full", colors.accent)}
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className={cn("absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize rounded-tr-full", colors.accent)}
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className={cn("absolute right-0 top-14 h-3 w-3 cursor-nesw-resize rounded-bl-full", colors.accent)}
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className={cn("absolute left-0 top-14 h-3 w-3 cursor-nwse-resize rounded-br-full", colors.accent)}
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
        </>
      )}
    </motion.div>
  )
}
