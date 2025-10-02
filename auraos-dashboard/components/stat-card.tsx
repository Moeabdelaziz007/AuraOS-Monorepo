"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean
  icon: LucideIcon
  color: "cyan" | "purple" | "green"
}

const colorClasses = {
  cyan: {
    icon: "text-[oklch(0.7_0.2_195)]",
    glow: "glow-cyan",
    border: "border-[oklch(0.7_0.2_195)]/20",
  },
  purple: {
    icon: "text-[oklch(0.65_0.25_300)]",
    glow: "glow-purple",
    border: "border-[oklch(0.65_0.25_300)]/20",
  },
  green: {
    icon: "text-[oklch(0.65_0.22_150)]",
    glow: "glow-green",
    border: "border-[oklch(0.65_0.22_150)]/20",
  },
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, color }: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300 hover:scale-[1.02]",
        colors.border,
        "hover:" + colors.glow,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-lg bg-card/50 backdrop-blur-sm", colors.glow)}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trendUp ? "text-accent" : "text-muted-foreground",
            )}
          >
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold font-mono">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
