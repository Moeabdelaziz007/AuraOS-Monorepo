"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, AlertCircle, Info, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "success",
    message: 'Workflow "Data Processing" completed',
    timestamp: "2 minutes ago",
    icon: CheckCircle2,
    color: "text-[oklch(0.65_0.22_150)]",
  },
  {
    id: 2,
    type: "info",
    message: 'New project "Neural Network v3" created',
    timestamp: "15 minutes ago",
    icon: Info,
    color: "text-[oklch(0.7_0.2_195)]",
  },
  {
    id: 3,
    type: "warning",
    message: "High memory usage detected on Node 4",
    timestamp: "1 hour ago",
    icon: AlertCircle,
    color: "text-[oklch(0.75_0.18_60)]",
  },
  {
    id: 4,
    type: "success",
    message: "AI model training finished successfully",
    timestamp: "2 hours ago",
    icon: Zap,
    color: "text-[oklch(0.65_0.25_300)]",
  },
  {
    id: 5,
    type: "info",
    message: "System backup completed",
    timestamp: "3 hours ago",
    icon: CheckCircle2,
    color: "text-[oklch(0.7_0.2_195)]",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30 transition-all duration-300 hover:border-primary/30 hover:bg-card/80",
                "animate-in fade-in slide-in-from-left-4",
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className={cn("mt-0.5", activity.color)}>
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-relaxed">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
