# 🎨 AuraOS Component Specifications - Kombai Design
## مواصفات مكونات AuraOS - تصميم Kombai

---

## 🖥️ **Desktop Environment Components**

### **Desktop Background - خلفية سطح المكتب**
```css
.quantum-desktop {
  background: linear-gradient(135deg, 
    var(--quantum-bg-primary) 0%,
    var(--quantum-bg-secondary) 50%,
    var(--quantum-bg-tertiary) 100%);
  position: relative;
  overflow: hidden;
}

.quantum-desktop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
  animation: quantum-float 30s infinite linear;
}
```

### **Desktop Icons - أيقونات سطح المكتب**
```css
.quantum-desktop-icon {
  width: 120px;
  height: 120px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quantum-desktop-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-desktop-icon:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 
    0 20px 40px rgba(0, 212, 255, 0.2),
    0 0 20px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-desktop-icon:hover::before {
  opacity: 1;
}

.quantum-desktop-icon:active {
  transform: translateY(-4px) scale(1.02);
}
```

### **Icon Container - حاوية الأيقونة**
```css
.quantum-icon-container {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;
}

.quantum-icon-image {
  font-size: 32px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
}

.quantum-desktop-icon:hover .quantum-icon-image {
  transform: scale(1.1);
  color: var(--quantum-secondary);
  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.4));
}

.quantum-icon-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--quantum-text-primary);
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

.quantum-desktop-icon:hover .quantum-icon-label {
  color: var(--quantum-primary);
}
```

---

## 🎛️ **Taskbar Components**

### **Taskbar Container - حاوية شريط المهام**
```css
.quantum-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  z-index: 10000;
  box-shadow: 
    0 -8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.quantum-taskbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  border-radius: 20px 20px 0 0;
  z-index: -1;
}
```

### **Start Button - زر البداية**
```css
.quantum-start-button {
  height: 48px;
  padding: 0 24px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  color: var(--quantum-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quantum-start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-start-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.2),
    0 0 20px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
}

.quantum-start-button:hover::before {
  opacity: 0.1;
}

.quantum-start-button.active {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
}

.quantum-start-icon {
  font-size: 20px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-start-button:hover .quantum-start-icon {
  transform: scale(1.1);
  color: var(--quantum-secondary);
}
```

### **Taskbar Windows - نوافذ شريط المهام**
```css
.quantum-taskbar-window {
  height: 48px;
  padding: 0 16px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  color: var(--quantum-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  max-width: 200px;
}

.quantum-taskbar-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-taskbar-window:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.2),
    0 0 15px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-taskbar-window:hover::before {
  opacity: 1;
}

.quantum-taskbar-window.active {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 
    0 4px 16px rgba(0, 212, 255, 0.2),
    0 0 10px rgba(0, 212, 255, 0.1);
}

.quantum-taskbar-window.minimized {
  opacity: 0.6;
  transform: scale(0.95);
}

.quantum-window-icon {
  font-size: 16px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-taskbar-window:hover .quantum-window-icon {
  transform: scale(1.1);
  color: var(--quantum-secondary);
}

.quantum-window-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.quantum-taskbar-window:hover .quantum-window-title {
  color: var(--quantum-primary);
}
```

### **System Tray - صينية النظام**
```css
.quantum-system-tray {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.quantum-tray-icon {
  width: 40px;
  height: 40px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  color: var(--quantum-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantum-tray-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-tray-icon:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.2),
    0 0 15px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-tray-icon:hover::before {
  opacity: 1;
}

.quantum-clock {
  padding: 0 16px;
  color: var(--quantum-text-primary);
  font-size: 12px;
  text-align: right;
  line-height: 1.3;
  font-weight: 500;
}

.quantum-clock-time {
  font-weight: 600;
  color: var(--quantum-primary);
}

.quantum-clock-date {
  opacity: 0.8;
  color: var(--quantum-text-secondary);
}
```

---

## 🪟 **Window Components**

### **Window Container - حاوية النافذة**
```css
.quantum-window {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 8px 24px rgba(0, 212, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.quantum-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  border-radius: 20px;
}

.quantum-window.active {
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.5),
    0 12px 32px rgba(0, 212, 255, 0.2);
  transform: translateY(-2px);
}

.quantum-window.active::before {
  opacity: 1;
}

.quantum-window:hover {
  box-shadow: 
    0 30px 100px rgba(0, 0, 0, 0.6),
    0 16px 40px rgba(0, 212, 255, 0.3);
}
```

### **Window Title Bar - شريط عنوان النافذة**
```css
.quantum-window-titlebar {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  height: 48px;
  position: relative;
}

.quantum-window-titlebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-window-titlebar:hover::before {
  opacity: 1;
}

.quantum-window-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--quantum-text-primary);
  transition: color 0.3s ease;
}

.quantum-window-title:hover {
  color: var(--quantum-primary);
}

.quantum-window-icon {
  font-size: 18px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-window-title:hover .quantum-window-icon {
  transform: scale(1.1);
  color: var(--quantum-secondary);
}
```

### **Window Controls - أزرار التحكم**
```css
.quantum-window-controls {
  display: flex;
  gap: 8px;
}

.quantum-window-control {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: var(--quantum-text-primary);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quantum-window-control::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-window-control:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.2),
    0 0 15px rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-window-control:hover::before {
  opacity: 1;
}

.quantum-window-control.close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.quantum-window-control.maximize:hover {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.quantum-window-control.minimize:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}
```

### **Window Content - محتوى النافذة**
```css
.quantum-window-content {
  flex: 1;
  overflow: auto;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 0 0 20px 20px;
  position: relative;
}

.quantum-window-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.02), 
    rgba(139, 92, 246, 0.02));
  z-index: -1;
  border-radius: 0 0 20px 20px;
}
```

---

## 🔍 **Search Components**

### **Global Search Overlay - نافذة البحث العامة**
```css
.quantum-search-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  background: var(--quantum-glass);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 24px;
  box-shadow: 
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 16px 40px rgba(0, 212, 255, 0.2);
  z-index: 20000;
  overflow: hidden;
  animation: quantum-search-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes quantum-search-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.quantum-search-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  z-index: -1;
}
```

### **Search Input - حقل البحث**
```css
.quantum-search-input-container {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.quantum-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--quantum-text-primary);
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
}

.quantum-search-input::placeholder {
  color: var(--quantum-text-muted);
}

.quantum-search-icon {
  font-size: 20px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-ai-indicator {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  animation: quantum-pulse 2s infinite;
}

@keyframes quantum-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```

### **Search Results - نتائج البحث**
```css
.quantum-search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.quantum-search-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantum-search-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-search-result:hover {
  transform: translateX(8px);
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.1),
    0 0 15px rgba(0, 212, 255, 0.05);
}

.quantum-search-result:hover::before {
  opacity: 1;
}

.quantum-result-icon {
  font-size: 20px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-search-result:hover .quantum-result-icon {
  transform: scale(1.1);
  color: var(--quantum-secondary);
}

.quantum-result-content {
  flex: 1;
}

.quantum-result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--quantum-text-primary);
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.quantum-search-result:hover .quantum-result-title {
  color: var(--quantum-primary);
}

.quantum-result-description {
  font-size: 12px;
  color: var(--quantum-text-secondary);
  line-height: 1.4;
}

.quantum-result-badge {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## 🔔 **Notification Components**

### **Toast Notification - إشعار التوست**
```css
.quantum-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 212, 255, 0.1);
  z-index: 15000;
  overflow: hidden;
  animation: quantum-toast-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes quantum-toast-slide {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.quantum-toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.1), 
    rgba(139, 92, 246, 0.1));
  z-index: -1;
}
```

### **Notification Content - محتوى الإشعار**
```css
.quantum-notification-content {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.quantum-notification-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.quantum-notification-text {
  flex: 1;
}

.quantum-notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--quantum-text-primary);
  margin-bottom: 4px;
}

.quantum-notification-message {
  font-size: 12px;
  color: var(--quantum-text-secondary);
  line-height: 1.4;
}

.quantum-notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.quantum-notification-action {
  padding: 6px 12px;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  color: var(--quantum-text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantum-notification-action:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.4);
  transform: translateY(-1px);
}
```

---

## 🎨 **App-Specific Components**

### **Dashboard Cards - بطاقات لوحة التحكم**
```css
.quantum-dashboard-card {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 212, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantum-dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-dashboard-card:hover::before {
  opacity: 1;
}

.quantum-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quantum-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--quantum-text-primary);
}

.quantum-card-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}
```

### **File Manager Items - عناصر مدير الملفات**
```css
.quantum-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantum-file-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quantum-file-item:hover {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  transform: translateX(8px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.1),
    0 0 15px rgba(0, 212, 255, 0.05);
}

.quantum-file-item:hover::before {
  opacity: 1;
}

.quantum-file-icon {
  font-size: 20px;
  color: var(--quantum-primary);
  transition: all 0.3s ease;
}

.quantum-file-item:hover .quantum-file-icon {
  transform: scale(1.1);
  color: var(--quantum-secondary);
}

.quantum-file-info {
  flex: 1;
}

.quantum-file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--quantum-text-primary);
  margin-bottom: 2px;
  transition: color 0.3s ease;
}

.quantum-file-item:hover .quantum-file-name {
  color: var(--quantum-primary);
}

.quantum-file-size {
  font-size: 12px;
  color: var(--quantum-text-secondary);
}
```

---

## 🎯 **Responsive Design**

### **Mobile Adaptations - التكيف مع الجوال**
```css
@media (max-width: 768px) {
  .quantum-desktop-icon {
    width: 100px;
    height: 100px;
    padding: 16px;
  }
  
  .quantum-taskbar {
    height: 56px;
    padding: 0 16px;
  }
  
  .quantum-search-overlay {
    width: 95vw;
    margin: 0 2.5vw;
  }
  
  .quantum-window {
    border-radius: 16px;
  }
  
  .quantum-window-titlebar {
    height: 44px;
    padding: 8px 16px;
  }
}
```

### **Tablet Adaptations - التكيف مع التابلت**
```css
@media (min-width: 769px) and (max-width: 1024px) {
  .quantum-desktop-icon {
    width: 110px;
    height: 110px;
  }
  
  .quantum-taskbar {
    height: 60px;
  }
  
  .quantum-search-overlay {
    width: 80vw;
  }
}
```

---

*This is the complete component specification for Kombai AI Design System*
*Target: Quantum Space-themed Web Operating System*
*Goal: Create the most detailed component library ever*
