"use client"

import type React from "react"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Taskbar } from "../layout/Taskbar"
import { StartMenu } from "../layout/StartMenu"
import { AppWindow } from "../layout/AppWindow"
import { WindowManagerProvider } from "../layout/WindowManager"
import { DesktopIcon } from "../desktop/DesktopIcon"
import { QuantumWallpaper } from "../desktop/QuantumWallpaper"
import { AINotesApp } from "../apps/AINotesApp"
import { AICodeEditorApp } from "../apps/AICodeEditorApp"
import { AIFileManagerApp } from "../apps/AIFileManagerApp"
import { AITerminalApp } from "../apps/AITerminalApp"
import { AIAutomationApp } from "../apps/AIAutomationApp"
import { AIAutopilotApp } from "../apps/AIAutopilotApp"
import { AIAgentsApp } from "../apps/AIAgentsApp"
import { AIAssistant } from "../ai/AIAssistant"
import { Settings } from "lucide-react"
import {
  AIAgentsIcon,
  AINotesIcon,
  AICodeEditorIcon,
  AIFileManagerIcon,
  AITerminalIcon,
  AIAutomationIcon,
  AIAutopilotIcon,
  AIAssistantIcon,
  SettingsIcon,
} from "../desktop/AppIcons"

interface DesktopIconData {
  id: string
  name: string
  icon: React.ReactNode
  type: "folder" | "file" | "app"
  position: { x: number; y: number }
  color: "cyan" | "purple" | "green" | "yellow"
}

export function DesktopOS() {
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [desktopIcons] = useState<DesktopIconData[]>([
    {
      id: "ai-agents",
      name: "AI Agents",
      icon: <AIAgentsIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 20, y: 20 },
      color: "cyan",
    },
    {
      id: "ai-notes",
      name: "AI Notes",
      icon: <AINotesIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 20, y: 160 },
      color: "purple",
    },
    {
      id: "ai-code-editor",
      name: "AI Code Editor",
      icon: <AICodeEditorIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 20, y: 300 },
      color: "green",
    },
    {
      id: "ai-file-manager",
      name: "AI File Manager",
      icon: <AIFileManagerIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 20, y: 440 },
      color: "yellow",
    },
    {
      id: "ai-terminal",
      name: "AI Terminal",
      icon: <AITerminalIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 170, y: 20 },
      color: "cyan",
    },
    {
      id: "ai-automation",
      name: "AI Automation",
      icon: <AIAutomationIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 170, y: 160 },
      color: "purple",
    },
    {
      id: "ai-autopilot",
      name: "AI Autopilot",
      icon: <AIAutopilotIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 170, y: 300 },
      color: "green",
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      icon: <AIAssistantIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 170, y: 440 },
      color: "yellow",
    },
    {
      id: "settings",
      name: "Settings",
      icon: <SettingsIcon className="h-10 w-10" />,
      type: "app",
      position: { x: 320, y: 20 },
      color: "cyan",
    },
  ])

  const handleIconDoubleClick = (iconId: string) => {
    if (!openWindows.includes(iconId)) {
      setOpenWindows([...openWindows, iconId])
    }
  }

  const handleCloseWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId))
  }

  const getWindowContent = (windowId: string) => {
    switch (windowId) {
      case "ai-agents":
        return <AIAgentsApp />
      case "ai-notes":
        return <AINotesApp />
      case "ai-code-editor":
        return <AICodeEditorApp />
      case "ai-file-manager":
        return <AIFileManagerApp />
      case "ai-terminal":
        return <AITerminalApp />
      case "ai-automation":
        return <AIAutomationApp />
      case "ai-autopilot":
        return <AIAutopilotApp />
      case "ai-assistant":
        return <AIAssistant />
      case "settings":
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-primary">System Settings</h2>
            <div className="grid gap-3">
              {[
                { name: "Appearance", desc: "Theme, colors, and animations" },
                { name: "System", desc: "Notifications, sound, and updates" },
                { name: "Network", desc: "WiFi, Bluetooth, and connections" },
                { name: "MCP Servers", desc: "Manage AI tool integrations" },
              ].map((setting, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 p-3 hover:bg-primary/5"
                >
                  <div className="text-primary">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{setting.name}</p>
                    <p className="text-xs text-muted-foreground">{setting.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return <div className="p-6">Content not found</div>
    }
  }

  const getWindowSize = (windowId: string) => {
    switch (windowId) {
      case "ai-agents":
        return { width: 1000, height: 700 }
      case "ai-notes":
        return { width: 900, height: 600 }
      case "ai-code-editor":
        return { width: 800, height: 600 }
      case "ai-file-manager":
        return { width: 700, height: 500 }
      case "ai-terminal":
        return { width: 800, height: 500 }
      case "ai-automation":
        return { width: 900, height: 650 }
      case "ai-autopilot":
        return { width: 800, height: 700 }
      case "ai-assistant":
        return { width: 700, height: 700 }
      default:
        return { width: 600, height: 400 }
    }
  }

  return (
    <WindowManagerProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
        <QuantumWallpaper />

        {/* Desktop Icons */}
        <div className="relative z-10 h-[calc(100vh-56px)] w-full">
          {desktopIcons.map((icon) => (
            <DesktopIcon key={icon.id} icon={icon} onDoubleClick={() => handleIconDoubleClick(icon.id)} />
          ))}
        </div>

        {/* Open Windows */}
        <AnimatePresence>
          {openWindows.map((windowId, index) => {
            const icon = desktopIcons.find((i) => i.id === windowId)
            if (!icon) return null

            return (
              <AppWindow
                key={windowId}
                id={windowId}
                title={icon.name}
                icon={icon.icon}
                color={icon.color}
                initialPosition={{
                  x: 100 + index * 40,
                  y: 80 + index * 40,
                }}
                initialSize={getWindowSize(windowId)}
                onClose={() => handleCloseWindow(windowId)}
              >
                {getWindowContent(windowId)}
              </AppWindow>
            )
          })}
        </AnimatePresence>

        {/* Start Menu */}
        <AnimatePresence>
          {startMenuOpen && <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} />}
        </AnimatePresence>

        {/* Taskbar */}
        <Taskbar
          onStartMenuToggle={() => setStartMenuOpen(!startMenuOpen)}
          startMenuOpen={startMenuOpen}
          openWindows={openWindows}
          onWindowClick={handleIconDoubleClick}
        />
      </div>
    </WindowManagerProvider>
  )
}
