"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Card } from "../ui/card"
import { FolderOpen, FileText, ImageIcon, Code, Search, Sparkles, ChevronRight, Home } from "lucide-react"
import { cn } from "../../lib/utils"

interface FileItem {
  id: string
  name: string
  type: "folder" | "file"
  icon: React.ReactNode
  size?: string
  modified: string
  aiTags?: string[]
}

export function AIFileManagerApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPath] = useState("Home")
  const [files] = useState<FileItem[]>([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      icon: <FolderOpen className="h-5 w-5 text-primary" />,
      modified: "2 hours ago",
      aiTags: ["work", "important"],
    },
    {
      id: "2",
      name: "Projects",
      type: "folder",
      icon: <FolderOpen className="h-5 w-5 text-secondary" />,
      modified: "1 day ago",
      aiTags: ["code", "development"],
    },
    {
      id: "3",
      name: "project-proposal.pdf",
      type: "file",
      icon: <FileText className="h-5 w-5 text-accent" />,
      size: "2.4 MB",
      modified: "3 hours ago",
      aiTags: ["document", "proposal"],
    },
    {
      id: "4",
      name: "dashboard-mockup.png",
      type: "file",
      icon: <ImageIcon className="h-5 w-5 text-chart-4" />,
      size: "5.8 MB",
      modified: "5 hours ago",
      aiTags: ["design", "ui"],
    },
    {
      id: "5",
      name: "app.tsx",
      type: "file",
      icon: <Code className="h-5 w-5 text-primary" />,
      size: "12 KB",
      modified: "1 hour ago",
      aiTags: ["code", "react"],
    },
  ])

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI File Manager</h2>
          </div>
          <Button variant="outline" size="sm" className="border-accent/50 bg-transparent">
            <Sparkles className="mr-2 h-4 w-4 text-accent" />
            AI Organize
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{currentPath}</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files with AI..."
            className="pl-10 border-primary/30 bg-background/50"
          />
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "cursor-pointer border-border/50 bg-background/30 p-4 transition-all hover:bg-background/50",
                  file.type === "folder" && "hover:border-primary/50",
                )}
              >
                <div className="flex items-center gap-4">
                  <div>{file.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{file.modified}</span>
                      {file.size && (
                        <>
                          <span>•</span>
                          <span>{file.size}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {file.aiTags && (
                    <div className="flex gap-1">
                      {file.aiTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* AI Insights */}
      <Card className="border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium">AI Insights</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You have 3 duplicate files that can be cleaned up. 2 large files haven't been accessed in 30 days.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
