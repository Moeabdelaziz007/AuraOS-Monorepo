"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Play, Sparkles, FileCode, Zap } from "lucide-react"

export function AICodeEditorApp() {
  const [code, setCode] = useState(`// Welcome to AI Code Editor
function greet(name: string) {
  return \`Hello, \${name}! Welcome to AuraOS.\`;
}

console.log(greet("Developer"));`)

  const [output, setOutput] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")

  const runCode = () => {
    try {
      // Simulate code execution
      setOutput("Hello, Developer! Welcome to AuraOS.\n\n✓ Code executed successfully")
    } catch (error) {
      setOutput(`Error: ${error}`)
    }
  }

  const getAISuggestion = () => {
    // Simulate AI code suggestion
    setAiSuggestion(`// AI Suggestion: Add error handling
function greet(name: string) {
  if (!name) {
    throw new Error("Name is required");
  }
  return \`Hello, \${name}! Welcome to AuraOS.\`;
}

try {
  console.log(greet("Developer"));
} catch (error) {
  console.error(error.message);
}`)
  }

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setCode(aiSuggestion)
      setAiSuggestion("")
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Code Editor</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={getAISuggestion} className="border-accent/50 bg-transparent">
            <Sparkles className="mr-2 h-4 w-4 text-accent" />
            AI Suggest
          </Button>
          <Button size="sm" onClick={runCode} className="bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-4 w-4" />
            Run Code
          </Button>
        </div>
      </div>

      {/* Editor */}
      <Tabs defaultValue="editor" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">
            <FileCode className="mr-2 h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="output">
            <Zap className="mr-2 h-4 w-4" />
            Output
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="flex-1">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-[400px] resize-none border-border/50 bg-black/90 font-mono text-sm text-accent"
            placeholder="Write your code here..."
          />
        </TabsContent>

        <TabsContent value="output" className="flex-1">
          <Card className="h-[400px] border-border/50 bg-black/90 p-4">
            <pre className="font-mono text-sm text-accent">{output || "Run your code to see output..."}</pre>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="flex-1">
          <Card className="h-[400px] border-border/50 bg-background/50 p-4">
            {aiSuggestion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-accent">AI Suggestion:</p>
                  <Button size="sm" onClick={applyAISuggestion} className="bg-accent hover:bg-accent/90">
                    Apply Suggestion
                  </Button>
                </div>
                <pre className="rounded-lg bg-black/90 p-4 font-mono text-sm text-accent">{aiSuggestion}</pre>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Click "AI Suggest" to get code improvements</p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
