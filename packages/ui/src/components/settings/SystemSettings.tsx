"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "../ui/card"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Slider } from "../ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { Palette, Monitor, Bell, Cpu, Database, Zap, Globe, Volume2, Wifi, Bluetooth, Activity } from "lucide-react"
import { cn } from "../../lib/utils"

interface MCPServer {
  id: string
  name: string
  status: "active" | "inactive" | "error"
  description: string
  tools: number
}

export function SystemSettings() {
  const [theme, setTheme] = useState("dark")
  const [accentColor, setAccentColor] = useState("cyan")
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState([75])
  const [autoStart, setAutoStart] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [transparency, setTransparency] = useState([80])

  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    {
      id: "filesystem",
      name: "FileSystem MCP Server",
      status: "active",
      description: "File operations and management",
      tools: 10,
    },
    {
      id: "emulator",
      name: "Emulator Control MCP Server",
      status: "active",
      description: "CPU emulation and control",
      tools: 16,
    },
    {
      id: "database",
      name: "Database MCP Server",
      status: "inactive",
      description: "Database operations",
      tools: 8,
    },
  ])

  const accentColors = [
    { id: "cyan", name: "Cyan", class: "bg-primary" },
    { id: "purple", name: "Purple", class: "bg-secondary" },
    { id: "green", name: "Green", class: "bg-accent" },
    { id: "yellow", name: "Yellow", class: "bg-chart-4" },
  ]

  const toggleMCPServer = (id: string) => {
    setMcpServers((prev) =>
      prev.map((server) =>
        server.id === id
          ? {
              ...server,
              status: server.status === "active" ? "inactive" : "active",
            }
          : server,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground"
      case "inactive":
        return "bg-muted text-muted-foreground"
      case "error":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="h-full p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-glow-cyan">System Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your AuraOS experience</p>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-card/50">
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="mcp" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Cpu className="mr-2 h-4 w-4" />
                MCP Servers
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="data-[state=active]:bg-chart-4/20 data-[state=active]:text-chart-4"
              >
                <Globe className="mr-2 h-4 w-4" />
                Network
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4">
              <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6 space-y-6">
                  {/* Theme */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="border-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Accent Color */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Accent Color</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setAccentColor(color.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                            accentColor === color.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <div className={cn("h-8 w-8 rounded-full", color.class)} />
                          <span className="text-xs font-medium">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Transparency */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Transparency</Label>
                      <span className="text-sm text-muted-foreground">{transparency[0]}%</span>
                    </div>
                    <Slider
                      value={transparency}
                      onValueChange={setTransparency}
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <Separator />

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth transitions and effects</p>
                    </div>
                    <Switch checked={animations} onCheckedChange={setAnimations} />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card className="border-secondary/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6 space-y-6">
                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show system notifications</p>
                      </div>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <Separator />

                  {/* Sound */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                          <Volume2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Sound</Label>
                          <p className="text-sm text-muted-foreground">Enable system sounds</p>
                        </div>
                      </div>
                      <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                    </div>
                    {soundEnabled && (
                      <div className="ml-14 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Volume</Label>
                          <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                        </div>
                        <Slider
                          value={volume}
                          onValueChange={setVolume}
                          max={100}
                          step={5}
                          className="[&_[role=slider]]:bg-secondary"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Auto Start */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Auto Start</Label>
                        <p className="text-sm text-muted-foreground">Launch AuraOS on system boot</p>
                      </div>
                    </div>
                    <Switch checked={autoStart} onCheckedChange={setAutoStart} />
                  </div>

                  <Separator />

                  {/* System Info */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">System Information</Label>
                    <div className="space-y-2 rounded-lg border border-border/50 bg-background/50 p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-mono">1.0.0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Build</span>
                        <span className="font-mono">2025.01.10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Platform</span>
                        <span className="font-mono">Web</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* MCP Servers Tab */}
            <TabsContent value="mcp" className="space-y-4">
              <Card className="border-accent/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">MCP Server Management</h3>
                      <p className="text-sm text-muted-foreground">Manage Model Context Protocol servers</p>
                    </div>
                    <Badge variant="outline" className="border-accent/50 text-accent">
                      {mcpServers.filter((s) => s.status === "active").length} Active
                    </Badge>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {mcpServers.map((server, index) => (
                        <motion.div
                          key={server.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-lg border border-border/50 bg-background/50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                                <Database className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{server.name}</h4>
                                  <Badge variant="outline" className={cn("text-xs", getStatusColor(server.status))}>
                                    {server.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{server.description}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{server.tools} tools available</span>
                                </div>
                              </div>
                            </div>
                            <Switch
                              checked={server.status === "active"}
                              onCheckedChange={() => toggleMCPServer(server.id)}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-4">
              <Card className="border-chart-4/30 bg-card/50 backdrop-blur-xl">
                <div className="p-6 space-y-6">
                  {/* WiFi */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-chart-4/10 p-2 text-chart-4">
                        <Wifi className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-base font-medium">WiFi</Label>
                        <p className="text-sm text-muted-foreground">Connected to AuraOS Network</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-accent/50 text-accent">
                      Connected
                    </Badge>
                  </div>

                  <Separator />

                  {/* Bluetooth */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-chart-4/10 p-2 text-chart-4">
                        <Bluetooth className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Bluetooth</Label>
                        <p className="text-sm text-muted-foreground">No devices connected</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  {/* Network Stats */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Network Statistics</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          Download
                        </div>
                        <p className="mt-2 text-2xl font-bold text-accent">45.2 MB/s</p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="h-4 w-4" />
                          Upload
                        </div>
                        <p className="mt-2 text-2xl font-bold text-primary">12.8 MB/s</p>
                      </div>
                    </div>
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
