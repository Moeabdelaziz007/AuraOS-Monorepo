"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Terminal, Sparkles, Zap } from "lucide-react"

interface TerminalLine {
  id: string
  type: "command" | "output" | "error"
  content: string
}

export function AITerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: "1", type: "output", content: "AuraOS Terminal v1.0.0" },
    { id: "2", type: "output", content: "Type 'help' for available commands or use AI assistance" },
    { id: "3", type: "output", content: "" },
  ])
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim()
    if (!trimmedCmd) return

    // Add command to history
    setCommandHistory([...commandHistory, trimmedCmd])
    setHistoryIndex(-1)

    // Add command line
    setLines((prev) => [...prev, { id: Date.now().toString(), type: "command", content: `$ ${trimmedCmd}` }])

    // Process command
    setTimeout(() => {
      const output = processCommand(trimmedCmd)
      setLines((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "output", content: output }])
    }, 100)

    setInput("")
  }

  const processCommand = (cmd: string): string => {
    const parts = cmd.toLowerCase().split(" ")
    const command = parts[0]

    switch (command) {
      case "help":
        return `Available commands:
  help     - Show this help message
  ls       - List files and directories
  pwd      - Print working directory
  clear    - Clear terminal
  echo     - Print message
  ai       - Get AI assistance
  status   - Show system status
  mcp      - MCP server information`

      case "ls":
        return `Documents/  Projects/  Downloads/  config.json  app.tsx`

      case "pwd":
        return `/home/user`

      case "clear":
        setLines([])
        return ""

      case "echo":
        return parts.slice(1).join(" ")

      case "ai":
        return `AI Assistant: I can help you with:
  • File operations
  • Code generation
  • System management
  • Command suggestions
Ask me anything!`

      case "status":
        return `System Status:
  CPU: 45% | Memory: 8.2GB/16GB | Storage: 256GB/512GB
  Network: Connected | MCP Servers: 2 Active`

      case "mcp":
        return `MCP Servers:
  ✓ FileSystem Server (10 tools)
  ✓ Emulator Control Server (16 tools)
Total: 26 tools available`

      default:
        return `Command not found: ${command}. Type 'help' for available commands.`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput("")
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    }
  }

  const getAISuggestion = () => {
    const suggestion = "ls -la && pwd"
    setInput(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-full flex-col bg-black/95 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-primary/30 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm text-primary">AuraOS Terminal</span>
        </div>
        <Button variant="outline" size="sm" onClick={getAISuggestion} className="border-accent/50 bg-transparent">
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          AI Suggest
        </Button>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 font-mono text-sm" ref={scrollRef}>
        <div className="space-y-1">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                line.type === "command"
                  ? "text-accent"
                  : line.type === "error"
                    ? "text-red-400"
                    : "text-muted-foreground"
              }
            >
              {line.content}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="mt-4 flex items-center gap-2 border-t border-primary/30 pt-3">
        <span className="font-mono text-accent">$</span>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-none bg-transparent font-mono text-accent focus-visible:ring-0"
          placeholder="Type a command..."
          autoFocus
        />
      </div>

      {/* Status Bar */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-accent" />
          <span>MCP Connected</span>
        </div>
        <span>{commandHistory.length} commands executed</span>
      </div>
    </div>
  )
}
