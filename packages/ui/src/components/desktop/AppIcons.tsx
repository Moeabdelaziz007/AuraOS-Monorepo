import type React from "react"

export const AIAgentsIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={{ filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' }}>
    <defs>
      <linearGradient id="agents-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="8" r="3" stroke="url(#agents-gradient)" strokeWidth="2.5" fill="none" />
    <path
      d="M12 11v4m0 0l-3 3m3-3l3 3M6 8a6 6 0 0112 0"
      stroke="url(#agents-gradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="18" r="2.5" fill="url(#agents-gradient)" opacity="0.8" />
    <circle cx="18" cy="18" r="2.5" fill="url(#agents-gradient)" opacity="0.8" />
  </svg>
)

export const AINotesIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="notes-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="url(#notes-gradient)" strokeWidth="2" fill="none" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="url(#notes-gradient)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="7" r="2" fill="url(#notes-gradient)" opacity="0.8" />
  </svg>
)

export const AICodeEditorIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="code-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#code-gradient)" strokeWidth="2" fill="none" />
    <path
      d="M8 9l-2 3 2 3M16 9l2 3-2 3M13 7l-2 10"
      stroke="url(#code-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const AIFileManagerIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="files-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <path
      d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      stroke="url(#files-gradient)"
      strokeWidth="2"
      fill="none"
    />
    <path d="M7 13h10M7 16h6" stroke="url(#files-gradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
)

export const AITerminalIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="terminal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#terminal-gradient)" strokeWidth="2" fill="none" />
    <path
      d="M6 9l4 3-4 3M12 15h6"
      stroke="url(#terminal-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="19" cy="7" r="1.5" fill="url(#terminal-gradient)" opacity="0.8" />
  </svg>
)

export const AIAutomationIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="automation-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <path
      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
      stroke="url(#automation-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="13" cy="2" r="1.5" fill="url(#automation-gradient)" opacity="0.8" />
    <circle cx="12" cy="22" r="1.5" fill="url(#automation-gradient)" opacity="0.8" />
  </svg>
)

export const AIAutopilotIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="autopilot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l-8 8h5v10h6V10h5l-8-8z"
      stroke="url(#autopilot-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="2" r="1.5" fill="url(#autopilot-gradient)" />
    <path
      d="M7 14l-2 2M17 14l2 2"
      stroke="url(#autopilot-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
)

export const AIAssistantIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="assistant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke="url(#assistant-gradient)"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="9" cy="10" r="1.5" fill="url(#assistant-gradient)" />
    <circle cx="15" cy="10" r="1.5" fill="url(#assistant-gradient)" />
    <path d="M9 13h6" stroke="url(#assistant-gradient)" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const SettingsIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="settings-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="3" stroke="url(#settings-gradient)" strokeWidth="2" fill="none" />
    <path
      d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"
      stroke="url(#settings-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
