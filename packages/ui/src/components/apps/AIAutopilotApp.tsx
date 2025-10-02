"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plane,
  Power,
  Gauge,
  Brain,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Sparkles,
} from "lucide-react"
import { Button } from "../ui/button"

export function AIAutopilotApp() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(true)
  const [autopilotMode, setAutopilotMode] = useState<"balanced" | "performance" | "efficiency">("balanced")

  const stats = [
    { label: "Tasks Automated", value: "247", change: "+12%", icon: <Zap className="h-4 w-4" /> },
    { label: "Time Saved", value: "8.5h", change: "+23%", icon: <Activity className="h-4 w-4" /> },
    { label: "Efficiency", value: "94%", change: "+5%", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "AI Confidence", value: "98%", change: "+2%", icon: <Brain className="h-4 w-4" /> },
  ]

  const activeAutomations = [
    { name: "Smart File Organization", status: "running", confidence: 98 },
    { name: "Code Quality Monitor", status: "running", confidence: 95 },
    { name: "Resource Optimization", status: "running", confidence: 92 },
    { name: "Security Scanning", status: "idle", confidence: 100 },
    { name: "Backup Management", status: "running", confidence: 97 },
  ]

  const recentActions = [
    { action: "Organized 12 files into Projects folder", time: "2 min ago", type: "success" },
    { action: "Optimized memory usage (freed 2.3 GB)", time: "5 min ago", type: "success" },
    { action: "Detected potential security issue", time: "8 min ago", type: "warning" },
    { action: "Auto-saved 3 documents", time: "12 min ago", type: "success" },
    { action: "Scheduled system maintenance", time: "15 min ago", type: "info" },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Autopilot</h2>
              <p className="text-xs text-muted-foreground">Intelligent system automation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autopilotEnabled ? "default" : "outline"}
              onClick={() => setAutopilotEnabled(!autopilotEnabled)}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {autopilotEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Autopilot Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="relative">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-75" />
                </div>
                <span className="text-sm font-medium text-green-500">Autopilot Active</span>
              </div>
              <h3 className="text-2xl font-bold">System Running Smoothly</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                AI is monitoring and optimizing your system in real-time
              </p>
            </div>
            <div className="rounded-full bg-background/50 p-4">
              <Gauge className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Mode Selection */}
          <div className="mt-4 flex gap-2">
            {[
              { id: "balanced", label: "Balanced", icon: <Shield className="h-4 w-4" /> },
              { id: "performance", label: "Performance", icon: <Zap className="h-4 w-4" /> },
              { id: "efficiency", label: "Efficiency", icon: <Sparkles className="h-4 w-4" /> },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setAutopilotMode(mode.id as any)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  autopilotMode === mode.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-background/30 text-muted-foreground hover:bg-background/50"
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">{stat.icon}</div>
                <span className="text-xs font-medium text-green-500">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Active Automations */}
          <div className="rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold">Active Automations</h3>
            <div className="space-y-2">
              {activeAutomations.map((auto, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{auto.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                        <div className="h-full bg-primary transition-all" style={{ width: `${auto.confidence}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{auto.confidence}%</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    {auto.status === "running" ? (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          <div className="rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold">Recent Actions</h3>
            <div className="space-y-2">
              {recentActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-background/50 p-3">
                  <div
                    className={`mt-0.5 rounded-full p-1 ${
                      action.type === "success"
                        ? "bg-green-500/10 text-green-500"
                        : action.type === "warning"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {action.type === "success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : action.type === "warning" ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{action.action}</p>
                    <p className="text-xs text-muted-foreground">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <div className="mt-4 text-center">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Configure Autopilot Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
