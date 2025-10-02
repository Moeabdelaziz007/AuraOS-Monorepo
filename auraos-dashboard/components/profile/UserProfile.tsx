"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Clock,
  Activity,
  Award,
  Zap,
  FileText,
  Terminal,
  Code,
  Settings,
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "file" | "command" | "system" | "ai"
  action: string
  timestamp: Date
  icon: React.ReactNode
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  date?: Date
}

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Alex Chen",
    email: "alex.chen@auraos.dev",
    bio: "AI enthusiast and developer building the future of operating systems.",
    location: "San Francisco, CA",
    joinDate: "January 2025",
    avatar: "/placeholder-user.jpg",
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  const stats = [
    { label: "Total Sessions", value: "127", icon: <Clock className="h-4 w-4" />, color: "cyan" },
    { label: "Commands Run", value: "1,234", icon: <Terminal className="h-4 w-4" />, color: "purple" },
    { label: "Files Created", value: "456", icon: <FileText className="h-4 w-4" />, color: "green" },
    { label: "AI Interactions", value: "89", icon: <Zap className="h-4 w-4" />, color: "yellow" },
  ]

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "file",
      action: "Created project-config.json",
      timestamp: new Date(Date.now() - 2 * 60000),
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "2",
      type: "ai",
      action: "Completed AI code analysis",
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: "3",
      type: "command",
      action: "Executed npm install",
      timestamp: new Date(Date.now() - 30 * 60000),
      icon: <Terminal className="h-4 w-4" />,
    },
    {
      id: "4",
      type: "system",
      action: "Updated system settings",
      timestamp: new Date(Date.now() - 45 * 60000),
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "5",
      type: "file",
      action: "Modified dashboard.tsx",
      timestamp: new Date(Date.now() - 60 * 60000),
      icon: <Code className="h-4 w-4" />,
    },
    {
      id: "6",
      type: "ai",
      action: "AI assistant conversation",
      timestamp: new Date(Date.now() - 90 * 60000),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: "7",
      type: "command",
      action: "Ran build script",
      timestamp: new Date(Date.now() - 120 * 60000),
      icon: <Terminal className="h-4 w-4" />,
    },
    {
      id: "8",
      type: "file",
      action: "Created new component",
      timestamp: new Date(Date.now() - 150 * 60000),
      icon: <FileText className="h-4 w-4" />,
    },
  ]

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Completed your first session",
      icon: <Award className="h-5 w-5" />,
      unlocked: true,
      date: new Date("2025-01-10"),
    },
    {
      id: "2",
      title: "Power User",
      description: "Ran 1000+ commands",
      icon: <Terminal className="h-5 w-5" />,
      unlocked: true,
      date: new Date("2025-01-15"),
    },
    {
      id: "3",
      title: "AI Explorer",
      description: "Used AI assistant 50 times",
      icon: <Zap className="h-5 w-5" />,
      unlocked: true,
      date: new Date("2025-01-18"),
    },
    {
      id: "4",
      title: "Code Master",
      description: "Created 500+ files",
      icon: <Code className="h-5 w-5" />,
      unlocked: false,
    },
    {
      id: "5",
      title: "System Expert",
      description: "Customized all settings",
      icon: <Settings className="h-5 w-5" />,
      unlocked: false,
    },
    {
      id: "6",
      title: "Marathon Runner",
      description: "Used AuraOS for 100 hours",
      icon: <Activity className="h-5 w-5" />,
      unlocked: false,
    },
  ]

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "file":
        return "text-primary"
      case "ai":
        return "text-secondary"
      case "command":
        return "text-accent"
      case "system":
        return "text-chart-4"
      default:
        return "text-foreground"
    }
  }

  const getStatColor = (color: string) => {
    switch (color) {
      case "cyan":
        return "bg-primary/10 text-primary border-primary/20"
      case "purple":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "green":
        return "bg-accent/10 text-accent border-accent/20"
      case "yellow":
        return "bg-chart-4/10 text-chart-4 border-chart-4/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  return (
    <div className="h-full p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-glow-cyan">User Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account and view your activity</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-2 border-primary/50">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback className="bg-primary/20 text-2xl text-primary">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4 flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editedProfile.name}
                            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                            className="border-primary/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                            className="border-primary/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                            className="border-primary/30"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editedProfile.location}
                            onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                            className="border-primary/30"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold">{profile.name}</h2>
                          <p className="text-sm text-muted-foreground">{profile.bio}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Joined {profile.joinDate}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave} className="bg-accent hover:bg-accent/90">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-primary/50"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className={`border ${getStatColor(stat.color)} bg-card/50 backdrop-blur-xl`}>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${getStatColor(stat.color)}`}>{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Activity & Achievements Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Activity className="mr-2 h-4 w-4" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
              >
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/50 p-3"
                        >
                          <div className={`rounded-lg bg-background p-2 ${getActivityColor(activity.type)}`}>
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="border-secondary/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-lg border p-4 ${
                          achievement.unlocked
                            ? "border-secondary/50 bg-secondary/5"
                            : "border-border/30 bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              achievement.unlocked ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{achievement.title}</h4>
                              {achievement.unlocked && (
                                <Badge variant="outline" className="border-secondary/50 text-secondary text-xs">
                                  Unlocked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            {achievement.date && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {achievement.date.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
