"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Hexagon, Bell, Wifi, Battery, Volume2, Cpu, Activity, Zap, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskbarProps {
  onStartMenuToggle: () => void
  startMenuOpen: boolean
  openWindows: string[]
  onWindowClick: (windowId: string) => void
}

export function Taskbar({ onStartMenuToggle, startMenuOpen, openWindows, onWindowClick }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [cpuUsage, setCpuUsage] = useState(45)
  const [showSystemTray, setShowSystemTray] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const cpuInterval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 40 + 30))
    }, 3000)

    return () => clearInterval(cpuInterval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="relative rounded-3xl border-2 border-primary/30 bg-[#0f0f1a]/95 px-4 py-2 shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-2xl">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />

          <div className="relative flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartMenuToggle}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 transition-all",
                startMenuOpen && "from-primary/30 to-primary/20",
              )}
            >
              <Hexagon className="h-6 w-6 fill-primary/20 text-primary" />
              <Activity className="absolute h-4 w-4 text-primary" />
              {startMenuOpen && (
                <motion.div
                  layoutId="taskbar-indicator"
                  className="absolute -bottom-1 h-1 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                />
              )}
            </motion.button>

            <Separator orientation="vertical" className="h-10 bg-border/30" />

            <div className="flex items-center gap-2">
              {openWindows.length === 0 ? (
                <div className="px-4 text-xs text-muted-foreground">No active apps</div>
              ) : (
                openWindows.map((windowId) => (
                  <motion.button
                    key={windowId}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onWindowClick(windowId)}
                    className="relative rounded-2xl bg-primary/20 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/30"
                    layoutId={`app-${windowId}`}
                  >
                    {windowId}
                    <motion.div
                      className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                  </motion.button>
                ))
              )}
            </div>

            <Separator orientation="vertical" className="h-10 bg-border/30" />

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary/10 px-3 transition-colors hover:bg-primary/20"
              >
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">{cpuUsage}%</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowSystemTray(!showSystemTray)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 transition-colors hover:bg-secondary/20"
              >
                <ChevronUp
                  className={cn("h-4 w-4 text-secondary transition-transform", showSystemTray && "rotate-180")}
                />
              </motion.button>
            </div>

            <Separator orientation="vertical" className="h-10 bg-border/30" />

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 px-4 py-1 transition-colors hover:from-accent/20 hover:to-accent/10"
            >
              <span className="text-sm font-bold text-accent">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-muted-foreground">{formatDate(currentTime)}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSystemTray && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 z-50 w-64 rounded-2xl border-2 border-secondary/30 bg-[#0f0f1a]/95 p-4 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-2xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-secondary">System Status</span>
                <Badge variant="outline" className="border-secondary/30 text-secondary">
                  Online
                </Badge>
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-2">
                {[
                  { icon: Wifi, label: "Network", value: "Connected", color: "text-accent" },
                  { icon: Volume2, label: "Volume", value: "80%", color: "text-secondary" },
                  { icon: Battery, label: "Battery", value: "85%", color: "text-chart-4" },
                  { icon: Zap, label: "Performance", value: "High", color: "text-primary" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between rounded-lg bg-background/30 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className={cn("text-xs font-medium", item.color)}>{item.value}</span>
                  </motion.div>
                ))}
              </div>

              <Separator className="bg-border/30" />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/20 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/30"
              >
                <Bell className="h-4 w-4" />3 Notifications
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 min-w-5 px-1">
                  3
                </Badge>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
