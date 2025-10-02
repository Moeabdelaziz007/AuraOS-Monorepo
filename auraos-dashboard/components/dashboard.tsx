"use client"

import { StatCard } from "@/components/stat-card"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { Cpu, FolderKanban, Workflow, MemoryStick } from "lucide-react"

const stats = [
  {
    title: "Total Projects",
    value: "24",
    trend: "+12%",
    trendUp: true,
    icon: FolderKanban,
    color: "cyan" as const,
  },
  {
    title: "Active Workflows",
    value: "8",
    trend: "+3",
    trendUp: true,
    icon: Workflow,
    color: "purple" as const,
  },
  {
    title: "CPU Usage",
    value: "42%",
    trend: "-8%",
    trendUp: false,
    icon: Cpu,
    color: "green" as const,
  },
  {
    title: "Memory Usage",
    value: "6.2 GB",
    trend: "+0.4 GB",
    trendUp: true,
    icon: MemoryStick,
    color: "cyan" as const,
  },
]

export function Dashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-glow-cyan text-balance">AuraOS</h1>
        <p className="text-muted-foreground text-lg">AI-Powered Operating System Dashboard</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}
