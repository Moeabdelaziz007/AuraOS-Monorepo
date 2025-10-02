"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import {
  Search,
  FolderOpen,
  Terminal,
  Code,
  Settings,
  ImageIcon,
  Music,
  Video,
  Globe,
  Database,
  Cpu,
  MessageSquare,
  FileText,
  Calendar,
  Mail,
  Users,
  Zap,
  Power,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "../../lib/utils"

interface App {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "productivity" | "development" | "media" | "system" | "ai"
  color: "cyan" | "purple" | "green" | "yellow"
  isRecent?: boolean
}

interface StartMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function StartMenu({ isOpen, onClose }: StartMenuProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredApps, setFilteredApps] = useState<App[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const apps: App[] = [
    {
      id: "file-manager",
      name: "File Manager",
      description: "Browse and manage files",
      icon: <FolderOpen className="h-5 w-5" />,
      category: "productivity",
      color: "cyan",
      isRecent: true,
    },
    {
      id: "terminal",
      name: "Terminal",
      description: "Command line interface",
      icon: <Terminal className="h-5 w-5" />,
      category: "development",
      color: "purple",
      isRecent: true,
    },
    {
      id: "code-editor",
      name: "Code Editor",
      description: "Write and edit code",
      icon: <Code className="h-5 w-5" />,
      category: "development",
      color: "green",
      isRecent: true,
    },
    {
      id: "settings",
      name: "Settings",
      description: "System configuration",
      icon: <Settings className="h-5 w-5" />,
      category: "system",
      color: "yellow",
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      description: "Chat with AI",
      icon: <MessageSquare className="h-5 w-5" />,
      category: "ai",
      color: "purple",
      isRecent: true,
    },
    {
      id: "image-viewer",
      name: "Image Viewer",
      description: "View and edit images",
      icon: <ImageIcon className="h-5 w-5" />,
      category: "media",
      color: "cyan",
    },
    {
      id: "music-player",
      name: "Music Player",
      description: "Play audio files",
      icon: <Music className="h-5 w-5" />,
      category: "media",
      color: "green",
    },
    {
      id: "video-player",
      name: "Video Player",
      description: "Watch videos",
      icon: <Video className="h-5 w-5" />,
      category: "media",
      color: "purple",
    },
    {
      id: "browser",
      name: "Web Browser",
      description: "Browse the internet",
      icon: <Globe className="h-5 w-5" />,
      category: "productivity",
      color: "cyan",
    },
    {
      id: "database",
      name: "Database Manager",
      description: "Manage databases",
      icon: <Database className="h-5 w-5" />,
      category: "development",
      color: "yellow",
    },
    {
      id: "system-monitor",
      name: "System Monitor",
      description: "Monitor system resources",
      icon: <Cpu className="h-5 w-5" />,
      category: "system",
      color: "cyan",
    },
    {
      id: "notes",
      name: "Notes",
      description: "Take notes",
      icon: <FileText className="h-5 w-5" />,
      category: "productivity",
      color: "green",
    },
    {
      id: "calendar",
      name: "Calendar",
      description: "Manage your schedule",
      icon: <Calendar className="h-5 w-5" />,
      category: "productivity",
      color: "purple",
    },
    {
      id: "mail",
      name: "Mail",
      description: "Email client",
      icon: <Mail className="h-5 w-5" />,
      category: "productivity",
      color: "cyan",
    },
    {
      id: "contacts",
      name: "Contacts",
      description: "Manage contacts",
      icon: <Users className="h-5 w-5" />,
      category: "productivity",
      color: "yellow",
    },
  ]

  const categories = [
    { id: "all", name: "All Apps", icon: <Zap className="h-4 w-4" /> },
    { id: "productivity", name: "Productivity", icon: <FileText className="h-4 w-4" /> },
    { id: "development", name: "Development", icon: <Code className="h-4 w-4" /> },
    { id: "media", name: "Media", icon: <Music className="h-4 w-4" /> },
    { id: "system", name: "System", icon: <Settings className="h-4 w-4" /> },
    { id: "ai", name: "AI Tools", icon: <MessageSquare className="h-4 w-4" /> },
  ]

  useEffect(() => {
    let filtered = apps

    if (selectedCategory !== "all") {
      filtered = filtered.filter((app) => app.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredApps(filtered)
  }, [searchQuery, selectedCategory])

  const recentApps = apps.filter((app) => app.isRecent)

  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary/20",
          hover: "hover:bg-primary/20 hover:border-primary/40",
        }
      case "purple":
        return {
          bg: "bg-secondary/10",
          text: "text-secondary",
          border: "border-secondary/20",
          hover: "hover:bg-secondary/20 hover:border-secondary/40",
        }
      case "green":
        return {
          bg: "bg-accent/10",
          text: "text-accent",
          border: "border-accent/20",
          hover: "hover:bg-accent/20 hover:border-accent/40",
        }
      case "yellow":
        return {
          bg: "bg-chart-4/10",
          text: "text-chart-4",
          border: "border-chart-4/20",
          hover: "hover:bg-chart-4/20 hover:border-chart-4/40",
        }
      default:
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary/20",
          hover: "hover:bg-primary/20 hover:border-primary/40",
        }
    }
  }

  const handleAppClick = (app: App) => {
    console.log("[v0] Opening app:", app.name)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Start Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 left-4 z-50 w-[600px]"
          >
            <Card className="border-primary/30 bg-card/95 shadow-2xl backdrop-blur-xl">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-glow-cyan">AuraOS</h2>
                    <p className="text-xs text-muted-foreground">AI-Powered Operating System</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-chart-4/20">
                      <Power className="h-4 w-4 text-chart-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search apps with AI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-primary/30 bg-background/50 focus-visible:ring-primary"
                  />
                </div>

                {/* Recent Apps */}
                {!searchQuery && (
                  <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recently Used</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {recentApps.map((app, index) => {
                        const colors = getColorClasses(app.color)
                        return (
                          <motion.button
                            key={app.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleAppClick(app)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
                              colors.bg,
                              colors.border,
                              colors.hover,
                            )}
                          >
                            <div className={colors.text}>{app.icon}</div>
                            <span className="text-xs font-medium text-foreground">{app.name}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Categories */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "border-border/50 transition-all",
                        selectedCategory === category.id
                          ? "border-primary bg-primary/20 text-primary"
                          : "hover:border-primary/50 hover:bg-primary/10",
                      )}
                    >
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Apps Grid */}
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-2 gap-3 pr-4">
                    {filteredApps.map((app, index) => {
                      const colors = getColorClasses(app.color)
                      return (
                        <motion.button
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleAppClick(app)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                            colors.border,
                            colors.hover,
                          )}
                        >
                          <div className={cn("rounded-lg p-2", colors.bg, colors.text)}>{app.icon}</div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-foreground">{app.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          {app.isRecent && (
                            <Badge variant="outline" className="border-primary/50 text-primary text-[10px]">
                              Recent
                            </Badge>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  {filteredApps.length === 0 && (
                    <div className="flex h-[200px] flex-col items-center justify-center text-center">
                      <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No apps found</p>
                      <p className="text-xs text-muted-foreground">Try a different search term</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
