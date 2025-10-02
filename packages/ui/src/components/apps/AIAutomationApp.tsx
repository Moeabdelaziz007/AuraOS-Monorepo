"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Zap,
  Play,
  Pause,
  Plus,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  Calendar,
  FileText,
  Mail,
  Database,
} from "lucide-react"
import { Button } from "../ui/button"

interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  actions: string[]
  status: "active" | "paused" | "error"
  lastRun?: string
  runsToday: number
}

export function AIAutomationApp() {
  const [activeTab, setActiveTab] = useState<"automations" | "templates" | "builder">("automations")
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: "1",
      name: "Auto-organize Files",
      description: "Automatically organize files by type and date",
      trigger: "When file is created",
      actions: ["Analyze file type", "Move to appropriate folder", "Add AI tags"],
      status: "active",
      lastRun: "2 minutes ago",
      runsToday: 24,
    },
    {
      id: "2",
      name: "Smart Code Review",
      description: "AI reviews code changes and suggests improvements",
      trigger: "When code is saved",
      actions: ["Analyze code quality", "Check for bugs", "Suggest optimizations"],
      status: "active",
      lastRun: "5 minutes ago",
      runsToday: 12,
    },
    {
      id: "3",
      name: "Daily Summary Report",
      description: "Generate AI summary of daily activities",
      trigger: "Every day at 6 PM",
      actions: ["Collect activity data", "Generate AI summary", "Send notification"],
      status: "paused",
      lastRun: "Yesterday",
      runsToday: 0,
    },
  ])

  const templates = [
    {
      name: "Auto-backup Projects",
      description: "Automatically backup projects to cloud storage",
      icon: <Database className="h-5 w-5" />,
      color: "cyan",
    },
    {
      name: "Smart Email Responses",
      description: "AI generates draft responses to emails",
      icon: <Mail className="h-5 w-5" />,
      color: "purple",
    },
    {
      name: "Code Documentation",
      description: "Auto-generate documentation for code files",
      icon: <FileText className="h-5 w-5" />,
      color: "green",
    },
    {
      name: "Task Scheduler",
      description: "AI schedules tasks based on priority and deadlines",
      icon: <Calendar className="h-5 w-5" />,
      color: "yellow",
    },
  ]

  const toggleAutomation = (id: string) => {
    setAutomations(
      automations.map((auto) =>
        auto.id === id ? { ...auto, status: auto.status === "active" ? "paused" : "active" } : auto,
      ),
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Automation Center</h2>
              <p className="text-xs text-muted-foreground">Autopilot for your OS</p>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/50 bg-background/30 px-4">
        {[
          { id: "automations", label: "Active Automations" },
          { id: "templates", label: "Templates" },
          { id: "builder", label: "Workflow Builder" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "automations" && (
          <div className="space-y-3">
            {automations.map((automation) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{automation.name}</h3>
                      {automation.status === "active" && (
                        <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      )}
                      {automation.status === "paused" && (
                        <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                          <Pause className="h-3 w-3" />
                          Paused
                        </span>
                      )}
                      {automation.status === "error" && (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{automation.description}</p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Trigger:</span>
                        <span className="text-foreground">{automation.trigger}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <GitBranch className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Actions:</span>
                        <div className="flex flex-wrap gap-1">
                          {automation.actions.map((action, i) => (
                            <span key={i} className="rounded bg-primary/10 px-2 py-0.5 text-primary">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last run: {automation.lastRun}
                      </div>
                      <div>Runs today: {automation.runsToday}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAutomation(automation.id)}
                      className="h-8 w-8 p-0"
                    >
                      {automation.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer rounded-lg border border-border/50 bg-background/50 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div
                  className={`mb-3 inline-flex rounded-lg bg-${template.color}-500/10 p-2 text-${template.color}-500`}
                >
                  {template.icon}
                </div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                <Button size="sm" variant="ghost" className="mt-3 w-full gap-2 group-hover:bg-primary/10">
                  <Plus className="h-4 w-4" />
                  Use Template
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "builder" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border/50 bg-background/30 p-8 text-center">
              <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-4">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Visual Workflow Builder</h3>
              <p className="mb-4 text-sm text-muted-foreground">Drag and drop to create custom automation workflows</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Start Building
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Triggers", "Conditions", "Actions"].map((category, i) => (
                <div key={i} className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <h4 className="mb-3 font-semibold">{category}</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="cursor-move rounded border border-border/30 bg-background/30 p-2 text-xs hover:border-primary/50"
                      >
                        {category} {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
