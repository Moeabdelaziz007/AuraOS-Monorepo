"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Send, Sparkles, Loader2, Copy, Check, RotateCcw, Zap, Code, FileText, Terminal } from "lucide-react"
import { cn } from "../../lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface SuggestedPrompt {
  id: string
  text: string
  icon: React.ReactNode
  category: "code" | "system" | "file" | "general"
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AuraOS AI Assistant. I can help you with code generation, system tasks, file management, and more. What would you like to do today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedPrompts: SuggestedPrompt[] = [
    {
      id: "1",
      text: "Generate a React component",
      icon: <Code className="h-4 w-4" />,
      category: "code",
    },
    {
      id: "2",
      text: "Check system status",
      icon: <Zap className="h-4 w-4" />,
      category: "system",
    },
    {
      id: "3",
      text: "Create a new file",
      icon: <FileText className="h-4 w-4" />,
      category: "file",
    },
    {
      id: "4",
      text: "Run a terminal command",
      icon: <Terminal className="h-4 w-4" />,
      category: "system",
    },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("component") || lowerPrompt.includes("react")) {
      return `I can help you create a React component! Here's a basic example:

\`\`\`tsx
export function MyComponent() {
  return (
    <div className="p-4">
      <h1>Hello from AuraOS!</h1>
    </div>
  )
}
\`\`\`

Would you like me to customize this component further?`
    }

    if (lowerPrompt.includes("system") || lowerPrompt.includes("status")) {
      return `System Status Report:
• CPU Usage: 45%
• Memory: 8.2GB / 16GB
• Storage: 256GB / 512GB
• Network: Connected
• MCP Servers: 2 Active

All systems are running optimally!`
    }

    if (lowerPrompt.includes("file") || lowerPrompt.includes("create")) {
      return `I can help you create a new file. What type of file would you like to create? Some options:
• TypeScript/JavaScript file
• JSON configuration
• Markdown document
• CSS stylesheet

Just let me know the filename and type!`
    }

    if (lowerPrompt.includes("command") || lowerPrompt.includes("terminal")) {
      return `I can help you run terminal commands through the MCP server integration. What command would you like to execute? I can help with:
• Package management (npm, yarn)
• Git operations
• File system operations
• Build commands

Please specify the command you'd like to run.`
    }

    return `I understand you're asking about "${prompt}". I'm here to help with:
• Code generation and debugging
• System management and monitoring
• File operations
• Terminal commands via MCP
• General assistance

How can I assist you further?`
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your AuraOS AI Assistant. I can help you with code generation, system tasks, file management, and more. What would you like to do today?",
        timestamp: new Date(),
      },
    ])
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "code":
        return "border-primary/50 hover:bg-primary/10 hover:border-primary"
      case "system":
        return "border-secondary/50 hover:bg-secondary/10 hover:border-secondary"
      case "file":
        return "border-accent/50 hover:bg-accent/10 hover:border-accent"
      default:
        return "border-chart-4/50 hover:bg-chart-4/10 hover:border-chart-4"
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-glow-cyan">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">Powered by MCP Integration</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="border-primary/50 bg-transparent">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Chat
          </Button>
        </motion.div>

        {/* Chat Messages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
            <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 border border-primary/50">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            <Sparkles className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "group relative max-w-[80%] rounded-lg p-4",
                          message.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "border border-border/50 bg-background/50",
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => handleCopy(message.content, message.id)}
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3 text-accent" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 border border-secondary/50">
                          <AvatarFallback className="bg-secondary/20 text-secondary">U</AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <Avatar className="h-8 w-8 border border-primary/50">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Suggested prompts:</p>
              <div className="grid gap-2 md:grid-cols-2">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                      getCategoryColor(prompt.category),
                    )}
                  >
                    <div className="rounded-lg bg-background/50 p-2">{prompt.icon}</div>
                    <span className="text-sm font-medium">{prompt.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-primary/30 bg-card/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 p-4">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask me anything about code, system tasks, or file operations..."
                className="flex-1 border-primary/30 bg-background/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* MCP Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="border-accent/50 text-accent">
              <Zap className="mr-1 h-3 w-3" />
              MCP Connected
            </Badge>
            <span>•</span>
            <span>2 servers active</span>
            <span>•</span>
            <span>26 tools available</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
