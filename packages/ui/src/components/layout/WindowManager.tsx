"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { AppWindow, type AppWindowProps } from "./AppWindow"

interface WindowState extends Omit<AppWindowProps, "onClose" | "onMinimize" | "onMaximize" | "zIndex"> {
  isMinimized: boolean
  zIndex: number
}

interface WindowManagerContextType {
  windows: WindowState[]
  openWindow: (window: Omit<WindowState, "zIndex" | "isMinimized">) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error("useWindowManager must be used within WindowManagerProvider")
  }
  return context
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [maxZIndex, setMaxZIndex] = useState(10)

  const openWindow = (window: Omit<WindowState, "zIndex" | "isMinimized">) => {
    const newZIndex = maxZIndex + 1
    setMaxZIndex(newZIndex)
    setWindows((prev) => [...prev, { ...window, zIndex: newZIndex, isMinimized: false }])
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w)))
  }

  const maximizeWindow = (id: string) => {
    focusWindow(id)
  }

  const focusWindow = (id: string) => {
    const newZIndex = maxZIndex + 1
    setMaxZIndex(newZIndex)
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w)))
  }

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
      }}
    >
      {children}
      {windows.map((window) => (
        <AppWindow
          key={window.id}
          {...window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
        />
      ))}
    </WindowManagerContext.Provider>
  )
}
