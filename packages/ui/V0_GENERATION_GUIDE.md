# v0.dev Component Generation Guide

## 🎯 Phase 1: Standard Components with v0.dev

This guide provides the exact prompts to use with v0.dev to generate high-quality components for AuraOS.

---

## 📋 Prerequisites

1. Go to [v0.dev](https://v0.dev)
2. Sign in (free tier available)
3. Use the prompts below one by one
4. Copy the generated code to the specified locations

---

## 🎨 Component 1: Dashboard Layout

### v0.dev Prompt:
```
Create a modern dashboard layout for an AI-powered operating system called AuraOS. 

Requirements:
- Dark theme with neon accents (cyan, purple, green)
- Grid layout with 4 stat cards showing: Total Projects, Active Workflows, CPU Usage, Memory Usage
- Each card should have an icon, title, value, and trend indicator
- Below the stats, add a 2-column layout:
  - Left: Recent Activity list (last 5 items with timestamps)
  - Right: Quick Actions panel with 4 action buttons
- Use shadcn/ui components
- Fully responsive
- TypeScript
- Include sample data

Style: Futuristic, tech-inspired, with subtle animations
```

### Save Location:
```
packages/ui/src/components/dashboard/Dashboard.tsx
```

### Expected Components:
- `Dashboard.tsx` - Main dashboard component
- `StatCard.tsx` - Reusable stat card
- `RecentActivity.tsx` - Activity list
- `QuickActions.tsx` - Action buttons panel

---

## ⚙️ Component 2: Settings Panel

### v0.dev Prompt:
```
Create a comprehensive settings panel for AuraOS with the following sections:

1. General Settings:
   - Theme selector (Dark, Light, Auto)
   - Language dropdown
   - Timezone selector

2. Account Settings:
   - Profile information form (name, email, avatar upload)
   - Password change section
   - Two-factor authentication toggle

3. Preferences:
   - Notifications toggle
   - Auto-save toggle
   - Default project location input

4. Advanced:
   - Debug mode toggle
   - Performance mode selector
   - Clear cache button

Use:
- Tabs for navigation between sections
- shadcn/ui Form components
- Proper validation
- Save/Cancel buttons
- Dark theme with neon accents
- TypeScript
- Responsive design

Style: Clean, organized, professional
```

### Save Location:
```
packages/ui/src/components/settings/Settings.tsx
```

### Expected Components:
- `Settings.tsx` - Main settings container
- `GeneralSettings.tsx` - General section
- `AccountSettings.tsx` - Account section
- `PreferencesSettings.tsx` - Preferences section
- `AdvancedSettings.tsx` - Advanced section

---

## 👤 Component 3: User Profile

### v0.dev Prompt:
```
Create a user profile page for AuraOS with:

1. Profile Header:
   - Large avatar with edit button
   - Username and role badge
   - Member since date
   - Edit profile button

2. Profile Stats (3 cards):
   - Projects Created
   - Workflows Executed
   - Hours Logged

3. Activity Timeline:
   - Last 10 activities with icons and timestamps
   - Infinite scroll placeholder

4. Skills & Badges:
   - Grid of skill tags
   - Achievement badges with tooltips

Use:
- shadcn/ui components (Card, Badge, Avatar, Button)
- Dark theme with cyan/purple accents
- Smooth animations
- TypeScript
- Responsive grid layout
- Sample data included

Style: Modern, professional, engaging
```

### Save Location:
```
packages/ui/src/components/profile/UserProfile.tsx
```

### Expected Components:
- `UserProfile.tsx` - Main profile page
- `ProfileHeader.tsx` - Header section
- `ProfileStats.tsx` - Stats cards
- `ActivityTimeline.tsx` - Activity list
- `SkillsBadges.tsx` - Skills and badges

---

## 📊 Component 4: Data Table

### v0.dev Prompt:
```
Create a powerful data table component for AuraOS to display projects/workflows:

Features:
- Sortable columns (Name, Status, Created, Modified)
- Search/filter bar
- Pagination (10, 25, 50 items per page)
- Row selection with checkboxes
- Bulk actions dropdown (Delete, Export, Archive)
- Status badges (Active, Paused, Completed, Failed)
- Action menu per row (Edit, Duplicate, Delete)
- Empty state with illustration

Use:
- shadcn/ui Table components
- Dark theme
- TypeScript
- Responsive (mobile: card view, desktop: table)
- Sample data (20 items)

Style: Clean, functional, professional
```

### Save Location:
```
packages/ui/src/components/dashboard/DataTable.tsx
```

---

## 📝 Component 5: Forms

### v0.dev Prompt:
```
Create a reusable form component for AuraOS with:

1. Project Creation Form:
   - Project name (required)
   - Description (textarea)
   - Category (select dropdown)
   - Tags (multi-select)
   - Privacy toggle (Public/Private)
   - Submit and Cancel buttons

2. Features:
   - Real-time validation
   - Error messages
   - Loading states
   - Success toast notification
   - Form reset after submit

Use:
- shadcn/ui Form components
- React Hook Form
- Zod validation
- TypeScript
- Dark theme with neon accents

Style: Clean, intuitive, user-friendly
```

### Save Location:
```
packages/ui/src/components/dashboard/ProjectForm.tsx
```

---

## 🎨 Component 6: Navigation

### v0.dev Prompt:
```
Create a sidebar navigation for AuraOS with:

1. Top Section:
   - AuraOS logo
   - Collapse/expand button

2. Navigation Items:
   - Dashboard (icon: LayoutDashboard)
   - Projects (icon: FolderOpen)
   - Workflows (icon: Workflow)
   - Terminal (icon: Terminal)
   - Settings (icon: Settings)
   - Help (icon: HelpCircle)

3. Bottom Section:
   - User avatar and name
   - Logout button

Features:
- Active state highlighting
- Hover effects
- Collapsible (icons only when collapsed)
- Smooth animations
- Dark theme with neon accents
- TypeScript
- Responsive (mobile: drawer, desktop: sidebar)

Use shadcn/ui components
```

### Save Location:
```
packages/ui/src/components/layout/Sidebar.tsx
```

---

## 🔔 Component 7: Notifications

### v0.dev Prompt:
```
Create a notification system for AuraOS:

1. Notification Bell Icon:
   - Badge with unread count
   - Dropdown panel on click

2. Notification Panel:
   - List of notifications (last 10)
   - Each notification has:
     - Icon based on type (success, error, info, warning)
     - Title and message
     - Timestamp
     - Mark as read button
   - "Mark all as read" button
   - "View all" link

3. Notification Types:
   - Success (green)
   - Error (red)
   - Warning (yellow)
   - Info (blue)

Use:
- shadcn/ui Popover, Badge
- Dark theme
- TypeScript
- Smooth animations
- Sample notifications

Style: Clean, organized, non-intrusive
```

### Save Location:
```
packages/ui/src/components/layout/Notifications.tsx
```

---

## 📦 Installation Steps

### Step 1: Install shadcn/ui

```bash
cd packages/ui

# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted, choose:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Step 2: Install Required Components

```bash
# Install all shadcn components we'll need
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add dialog
```

### Step 3: Install Additional Dependencies

```bash
pnpm add react-hook-form zod @hookform/resolvers
pnpm add lucide-react
pnpm add date-fns
pnpm add recharts
```

---

## 🎨 Theme Configuration

### Update `packages/ui/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 180 100% 50%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 280 100% 70%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 142 76% 36%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 180 100% 50%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Neon glow effects */
.neon-cyan {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.neon-purple {
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

.neon-green {
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}
```

---

## 📝 Usage Instructions

### For Each Component:

1. **Go to v0.dev**
   - Visit https://v0.dev
   - Sign in with your account

2. **Paste the Prompt**
   - Copy the exact prompt from above
   - Paste into v0.dev chat

3. **Review Generated Code**
   - v0 will generate the component
   - Review the code and preview

4. **Copy to AuraOS**
   - Click "Copy Code" button
   - Create the file in specified location
   - Paste the code

5. **Adjust Imports**
   - Update import paths if needed
   - Ensure shadcn/ui components are imported correctly

6. **Test the Component**
   - Import in your app
   - Verify it renders correctly
   - Check responsiveness

---

## 🔄 Integration Example

### After generating Dashboard component:

```typescript
// packages/ui/src/App.tsx
import { Dashboard } from './components/dashboard/Dashboard';
import { Sidebar } from './components/layout/Sidebar';

function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
```

---

## ✅ Checklist

After generating all components, verify:

- [ ] All components render without errors
- [ ] Dark theme is applied correctly
- [ ] Neon accents (cyan, purple, green) are visible
- [ ] Components are responsive
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Animations work smoothly
- [ ] Forms validate properly
- [ ] Navigation works
- [ ] Data displays correctly

---

## 🎯 Next Steps

After completing Phase 1 (v0.dev components):

1. **Phase 2: Custom OS Components**
   - Desktop Environment
   - Terminal Emulator
   - Window Manager
   - Debugger UI
   - BASIC IDE

2. **Phase 3: Integration**
   - Connect to backend APIs
   - Add real data
   - Implement state management
   - Add authentication

3. **Phase 4: Polish**
   - Animations
   - Transitions
   - Loading states
   - Error handling

---

## 💡 Tips

1. **Iterate on Prompts**
   - If output isn't perfect, refine the prompt
   - Add more specific requirements
   - Request changes

2. **Customize After Generation**
   - v0 gives you a starting point
   - Feel free to modify colors, spacing, etc.
   - Add AuraOS-specific features

3. **Reuse Components**
   - Extract common patterns
   - Create a component library
   - Document usage

4. **Test Thoroughly**
   - Test on different screen sizes
   - Test with real data
   - Test edge cases

---

## 📚 Resources

- [v0.dev](https://v0.dev) - AI component generator
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide Icons](https://lucide.dev) - Icons
- [React Hook Form](https://react-hook-form.com) - Forms

---

**Ready to generate components!** 🚀

Start with Component 1 (Dashboard) and work your way through the list.
