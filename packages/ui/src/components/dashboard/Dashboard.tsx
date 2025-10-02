"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import {
  Cpu,
  HardDrive,
  ActivityIcon,
  Zap,
  FolderOpen,
  Terminal,
  Settings,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  FileText,
  Code,
  Database,
} from "lucide-react"

// Types
interface SystemStat {
  id: string
  label: string
  value: string
  percentage: number
  trend: "up" | "down" | "stable"
  trendValue: string
  icon: React.ReactNode
  color: "cyan" | "purple" | "green" | "yellow"
}

interface RecentActivity {
  id: string
  type: "file" | "command" | "system" | "ai"
  title: string
  description: string
  timestamp: Date
  icon: React.ReactNode
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  color: "cyan" | "purple" | "green" | "yellow"
  onClick: () => void
}

export function Dashboard() {
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [systemStats, setSystemStats] = useState<SystemStat[]>([
    {
      id: "cpu",
      label: "CPU Usage",
      value: "45%",
      percentage: 45,
      trend: "up",
      trendValue: "+5%",
      icon: <Cpu className="h-5 w-5" />,
      color: "cyan",
    },
    {
      id: "memory",
      label: "Memory",
      value: "6.2 GB",
      percentage: 62,
      trend: "stable",
      trendValue: "0%",
      icon: <ActivityIcon className="h-5 w-5" />,
      color: "purple",
    },
    {
      id: "storage",
      label: "Storage",
      value: "234 GB",
      percentage: 78,
      trend: "up",
      trendValue: "+2%",
      icon: <HardDrive className="h-5 w-5" />,
      color: "green",
    },
    {
      id: "power",
      label: "Power",
      value: "85%",
      percentage: 85,
      trend: "down",
      trendValue: "-3%",
      icon: <Zap className="h-5 w-5" />,
      color: "yellow",
    },
  ])

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "file",
      title: "File Created",
      description: "project-config.json",
      timestamp: new Date(Date.now() - 2 * 60000),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "2",
      type: "ai",
      title: "AI Task Completed",
      description: "Code analysis finished",
      timestamp: new Date(Date.now() - 5 * 60000),
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "3",
      type: "command",
      title: "Command Executed",
      description: "npm install completed",
      timestamp: new Date(Date.now() - 8 * 60000),
      icon: <Terminal className="h-4 w-4" />,
    },
    {
      id: "4",
      type: "system",
      title: "System Update",
      description: "MCP Gateway restarted",
      timestamp: new Date(Date.now() - 12 * 60000),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "5",
      type: "file",
      title: "Database Modified",
      description: "users.db updated",
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: <Database className="h-4 w-4" />,
    },
  ])

  const quickActions: QuickAction[] = [
    {
      id: "files",
      label: "File Manager",
      icon: <FolderOpen className="h-5 w-5" />,
      color: "cyan",
      onClick: () => console.log("[v0] Open File Manager"),
    },
    {
      id: "terminal",
      label: "Terminal",
      icon: <Terminal className="h-5 w-5" />,
      color: "purple",
      onClick: () => console.log("[v0] Open Terminal"),
    },
    {
      id: "code",
      label: "Code Editor",
      icon: <Code className="h-5 w-5" />,
      color: "green",
      onClick: () => console.log("[v0] Open Code Editor"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      color: "yellow",
      onClick: () => console.log("[v0] Open Settings"),
    },
  ]

  // Simulate real-time system stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          percentage: Math.max(10, Math.min(95, stat.percentage + (Math.random() - 0.5) * 5)),
          value:
            stat.id === "cpu"
              ? `${Math.round(stat.percentage)}%`
              : stat.id === "memory"
                ? `${(stat.percentage / 10).toFixed(1)} GB`
                : stat.id === "storage"
                  ? `${Math.round(stat.percentage * 3)} GB`
                  : `${Math.round(stat.percentage)}%`,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary/20",
          glow: "glow-cyan",
        }
      case "purple":
        return {
          bg: "bg-secondary/10",
          text: "text-secondary",
          border: "border-secondary/20",
          glow: "glow-purple",
        }
      case "green":
        return {
          bg: "bg-accent/10",
          text: "text-accent",
          border: "border-accent/20",
          glow: "glow-green",
        }
      case "yellow":
        return {
          bg: "bg-chart-4/10",
          text: "text-chart-4",
          border: "border-chart-4/20",
          glow: "glow-cyan",
        }
      default:
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary/20",
          glow: "glow-cyan",
        }
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-glow-cyan">AuraOS</h1>
            <p className="text-sm text-muted-foreground">AI-Powered Operating System</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-primary" />
              System Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className="border-secondary/50 text-secondary hover:bg-secondary/10"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              AI Assistant
              {aiPanelOpen ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-secondary/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold text-secondary">AI Assistant</h3>
                    <Badge variant="outline" className="ml-auto border-secondary/50 text-secondary">
                      MCP Enabled
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-secondary/20 bg-background/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      AI Assistant integration ready. Connect to MCP Gateway for natural language OS control, file
                      operations, and emulator management.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-secondary/50 text-secondary hover:bg-secondary/10 bg-transparent"
                      >
                        Start Chat
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        View Commands
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {systemStats.map((stat, index) => {
            const colors = getColorClasses(stat.color)
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`group relative overflow-hidden border-${stat.color === "cyan" ? "primary" : stat.color === "purple" ? "secondary" : stat.color === "green" ? "accent" : "chart-4"}/30 bg-card/50 backdrop-blur-xl transition-all hover:${colors.glow}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-lg ${colors.bg} p-3 ${colors.text}`}>{stat.icon}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {stat.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : stat.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-accent" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={
                            stat.trend === "up"
                              ? "text-destructive"
                              : stat.trend === "down"
                                ? "text-accent"
                                : "text-muted-foreground"
                          }
                        >
                          {stat.trendValue}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className={`h-full ${colors.bg.replace("/10", "")} ${colors.glow}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-primary">Recent Activity</h3>
                  <Badge variant="outline" className="ml-auto border-primary/50 text-primary">
                    Live
                  </Badge>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="group flex items-start gap-4 rounded-lg border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
                      >
                        <div
                          className={`rounded-lg ${
                            activity.type === "file"
                              ? "bg-primary/10 text-primary"
                              : activity.type === "ai"
                                ? "bg-secondary/10 text-secondary"
                                : activity.type === "command"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-chart-4/10 text-chart-4"
                          } p-2`}
                        >
                          {activity.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-accent/30 bg-card/50 backdrop-blur-xl">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-accent">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const colors = getColorClasses(action.color)
                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <Button
                          variant="outline"
                          className={`w-full justify-start ${colors.border} ${colors.text} hover:${colors.bg} hover:${colors.glow} transition-all`}
                          onClick={action.onClick}
                        >
                          <div className={`mr-3 ${colors.text}`}>{action.icon}</div>
                          {action.label}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">System Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-mono text-foreground">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-mono text-foreground">2h 34m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MCP Status</span>
                      <Badge variant="outline" className="border-accent/50 text-accent">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
