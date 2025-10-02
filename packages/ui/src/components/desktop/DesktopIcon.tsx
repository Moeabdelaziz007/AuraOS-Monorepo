"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface DesktopIconProps {
  icon: {
    id: string
    name: string
    icon: React.ReactNode
    type: "folder" | "file" | "app"
    position: { x: number; y: number }
    color: "cyan" | "purple" | "green" | "yellow"
  }
  onDoubleClick: () => void
}

export function DesktopIcon({ icon, onDoubleClick }: DesktopIconProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return "text-primary hover:bg-primary/20 shadow-primary/50"
      case "purple":
        return "text-secondary hover:bg-secondary/20 shadow-secondary/50"
      case "green":
        return "text-accent hover:bg-accent/20 shadow-accent/50"
      case "yellow":
        return "text-chart-4 hover:bg-chart-4/20 shadow-chart-4/50"
      default:
        return "text-foreground hover:bg-muted shadow-foreground/50"
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onDoubleClick={onDoubleClick}
      className={cn(
        "absolute flex w-28 flex-col items-center gap-3 rounded-xl p-4 transition-all duration-200",
        getColorClasses(icon.color),
      )}
      style={{
        left: icon.position.x,
        top: icon.position.y,
      }}
    >
      <motion.div
        className="rounded-2xl bg-background/30 p-4 backdrop-blur-md border border-white/10 shadow-lg"
        whileHover={{ boxShadow: "0 0 20px currentColor" }}
      >
        {icon.icon}
      </motion.div>
      <span className="text-xs font-semibold text-foreground text-balance text-center drop-shadow-lg">{icon.name}</span>
    </motion.button>
  )
}
