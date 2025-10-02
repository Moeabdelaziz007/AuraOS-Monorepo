"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import {
  Bot,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Brain,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react"

interface Agent {
  id: string
  name: string
  type: "automation" | "analysis" | "monitoring" | "assistant"
  status: "active" | "idle" | "error"
  tasksCompleted: number
  uptime: string
  description: string
  capabilities: string[]
}

export function AIAgentsApp() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "System Monitor",
      type: "monitoring",
      status: "active",
      tasksCompleted: 1247,
      uptime: "12h 34m",
      description: "Monitors system health and performance metrics",
      capabilities: ["CPU Monitoring", "Memory Tracking", "Disk Analysis", "Network Stats"],
    },
    {
      id: "2",
      name: "Code Optimizer",
      type: "analysis",
      status: "active",
      tasksCompleted: 89,
      uptime: "8h 12m",
      description: "Analyzes and optimizes code for better performance",
      capabilities: ["Code Review", "Performance Analysis", "Bug Detection", "Refactoring"],
    },
    {
      id: "3",
      name: "Task Automator",
      type: "automation",
      status: "idle",
      tasksCompleted: 456,
      uptime: "24h 00m",
      description: "Automates repetitive tasks and workflows",
      capabilities: ["File Management", "Batch Processing", "Scheduled Tasks", "API Integration"],
    },
    {
      id: "4",
      name: "Data Analyst",
      type: "analysis",
      status: "active",
      tasksCompleted: 234,
      uptime: "6h 45m",
      description: "Analyzes data patterns and generates insights",
      capabilities: ["Data Mining", "Pattern Recognition", "Predictive Analysis", "Reporting"],
    },
  ])

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0])
  const [newAgentName, setNewAgentName] = useState("")

  const toggleAgentStatus = (agentId: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === agentId ? { ...agent, status: agent.status === "active" ? "idle" : ("active" as const) } : agent,
      ),
    )
  }

  const deleteAgent = (agentId: string) => {
    setAgents(agents.filter((agent) => agent.id !== agentId))
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(agents[0] || null)
    }
  }

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "text-accent"
      case "idle":
        return "text-yellow-500"
      case "error":
        return "text-destructive"
    }
  }

  const getTypeIcon = (type: Agent["type"]) => {
    switch (type) {
      case "automation":
        return <Zap className="h-4 w-4" />
      case "analysis":
        return <Brain className="h-4 w-4" />
      case "monitoring":
        return <Activity className="h-4 w-4" />
      case "assistant":
        return <Bot className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-full">
      {/* Agents List */}
      <div className="w-80 border-r border-border/50 bg-background/30 backdrop-blur-sm">
        <div className="border-b border-border/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Agents</h3>
            <Badge variant="secondary" className="ml-auto">
              {agents.filter((a) => a.status === "active").length} Active
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New agent name..."
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 p-2">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedAgent(agent)}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selectedAgent?.id === agent.id
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/30 bg-background/50 hover:bg-background/80"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={getStatusColor(agent.status)}>{getTypeIcon(agent.type)}</div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${agent.status === "active" ? "bg-accent" : "bg-muted"}`} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {agent.tasksCompleted}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {agent.uptime}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agent Details */}
      <div className="flex-1 p-6">
        {selectedAgent ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={`rounded-lg border border-border/50 bg-background/50 p-3 ${getStatusColor(selectedAgent.status)}`}
                  >
                    {getTypeIcon(selectedAgent.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedAgent.status === "active" ? "destructive" : "default"}
                  onClick={() => toggleAgentStatus(selectedAgent.id)}
                >
                  {selectedAgent.status === "active" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteAgent(selectedAgent.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  Status
                </div>
                <p className={`text-2xl font-bold capitalize ${getStatusColor(selectedAgent.status)}`}>
                  {selectedAgent.status}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Tasks Completed
                </div>
                <p className="text-2xl font-bold text-primary">{selectedAgent.tasksCompleted}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/30 p-4 backdrop-blur-sm">
                <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Uptime
                </div>
                <p className="text-2xl font-bold text-secondary">{selectedAgent.uptime}</p>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Capabilities</h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedAgent.capabilities.map((capability, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-sm">{capability}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Recent Activity</h3>
              <div className="space-y-2">
                {[
                  { action: "Analyzed system performance", time: "2 minutes ago", status: "success" },
                  { action: "Optimized memory usage", time: "15 minutes ago", status: "success" },
                  { action: "Detected potential issue", time: "1 hour ago", status: "warning" },
                  { action: "Completed scheduled task", time: "2 hours ago", status: "success" },
                ].map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3 backdrop-blur-sm"
                  >
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Bot className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No agent selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
