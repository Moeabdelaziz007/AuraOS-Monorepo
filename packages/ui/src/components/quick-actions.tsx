"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Zap, Plus, Play, Settings } from "lucide-react"
import { cn } from "../lib/utils"

const actions = [
  {
    id: 1,
    label: "New Project",
    icon: Plus,
    color: "cyan",
    description: "Create a new AI project",
  },
  {
    id: 2,
    label: "Run Workflow",
    icon: Play,
    color: "green",
    description: "Execute workflow pipeline",
  },
  {
    id: 3,
    label: "System Settings",
    icon: Settings,
    color: "purple",
    description: "Configure system parameters",
  },
  {
    id: 4,
    label: "Quick Deploy",
    icon: Zap,
    color: "cyan",
    description: "Deploy to production",
  },
]

const colorClasses = {
  cyan: {
    bg: "bg-[oklch(0.7_0.2_195)]/10",
    hover: "hover:bg-[oklch(0.7_0.2_195)]/20",
    border: "border-[oklch(0.7_0.2_195)]/30",
    text: "text-[oklch(0.7_0.2_195)]",
    glow: "hover:glow-cyan",
  },
  purple: {
    bg: "bg-[oklch(0.65_0.25_300)]/10",
    hover: "hover:bg-[oklch(0.65_0.25_300)]/20",
    border: "border-[oklch(0.65_0.25_300)]/30",
    text: "text-[oklch(0.65_0.25_300)]",
    glow: "hover:glow-purple",
  },
  green: {
    bg: "bg-[oklch(0.65_0.22_150)]/10",
    hover: "hover:bg-[oklch(0.65_0.22_150)]/20",
    border: "border-[oklch(0.65_0.22_150)]/30",
    text: "text-[oklch(0.65_0.22_150)]",
    glow: "hover:glow-green",
  },
}

export function QuickActions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-secondary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const colors = colorClasses[action.color as keyof typeof colorClasses]
            return (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "h-auto flex-col items-start gap-2 p-4 transition-all duration-300",
                  colors.bg,
                  colors.hover,
                  colors.border,
                  colors.glow,
                  "animate-in fade-in slide-in-from-right-4",
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <action.icon className={cn("h-5 w-5", colors.text)} />
                  <span className="font-semibold text-foreground">{action.label}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left w-full leading-relaxed">{action.description}</p>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
