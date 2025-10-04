# ✈️ AuraOS AI Travel Agency - Kombai Design Specification
## وكالة السفر الذكية - مواصفات التصميم

---

## 🎯 **App Concept & Vision**
Create the world's most advanced AI-powered travel agency that combines quantum space design with intelligent travel planning. Every interaction should feel like having a personal travel concierge from the future.

---

## 🎨 **App Identity**

### **App Name & Branding**
```
App Name: "Quantum Travel"
Arabic Name: "وكالة السفر الكمية"
Tagline: "Journey Beyond Imagination"
Arabic Tagline: "رحلة تتجاوز الخيال"
```

### **App Icon Design**
```css
.quantum-travel-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.quantum-travel-icon::before {
  content: '✈️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: quantum-travel-float 3s infinite ease-in-out;
}

@keyframes quantum-travel-float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
  50% { transform: translate(-50%, -50%) translateY(-4px); }
}
```

---

## 🏠 **Home Screen Design**

### **Hero Section - القسم الرئيسي**
```css
.quantum-travel-hero {
  background: linear-gradient(135deg, 
    var(--quantum-bg-primary) 0%,
    var(--quantum-bg-secondary) 50%,
    var(--quantum-bg-tertiary) 100%);
  position: relative;
  overflow: hidden;
  padding: 40px 24px;
  border-radius: 24px;
  margin: 20px;
}

.quantum-travel-hero::before {
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
  z-index: -1;
}

.quantum-travel-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.quantum-travel-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--quantum-text-primary);
  margin-bottom: 16px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quantum-travel-subtitle {
  font-size: 16px;
  color: var(--quantum-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.quantum-travel-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
```

### **Quick Search Bar - شريط البحث السريع**
```css
.quantum-travel-search {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  margin: 20px;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 212, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.quantum-travel-search::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  z-index: -1;
}

.quantum-search-form {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.quantum-search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantum-search-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--quantum-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quantum-search-input {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.quantum-search-input:focus {
  outline: none;
  border-color: var(--quantum-primary);
  box-shadow: 
    0 0 0 3px rgba(0, 212, 255, 0.1),
    0 8px 24px rgba(0, 212, 255, 0.1);
}

.quantum-search-button {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantum-search-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
}
```

---

## 🌍 **Destination Cards**

### **Destination Grid - شبكة الوجهات**
```css
.quantum-destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 20px;
}

.quantum-destination-card {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

.quantum-destination-card::before {
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
  z-index: 1;
}

.quantum-destination-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 12px 32px rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

.quantum-destination-card:hover::before {
  opacity: 1;
}

.quantum-destination-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  position: relative;
  overflow: hidden;
}

.quantum-destination-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: quantum-shimmer 3s infinite ease-in-out;
}

@keyframes quantum-shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.quantum-destination-content {
  padding: 24px;
  position: relative;
  z-index: 2;
}

.quantum-destination-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--quantum-text-primary);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.quantum-destination-card:hover .quantum-destination-title {
  color: var(--quantum-primary);
}

.quantum-destination-description {
  font-size: 14px;
  color: var(--quantum-text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.quantum-destination-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quantum-destination-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--quantum-primary);
}

.quantum-destination-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--quantum-gold);
}

.quantum-destination-actions {
  display: flex;
  gap: 12px;
}

.quantum-destination-button {
  flex: 1;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.quantum-destination-button:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
}

.quantum-destination-button.primary {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  color: white;
  border: none;
}

.quantum-destination-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
}
```

---

## 🤖 **AI Assistant Features**

### **AI Travel Assistant - مساعد السفر الذكي**
```css
.quantum-ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
}

.quantum-ai-assistant:hover {
  transform: scale(1.1);
  box-shadow: 
    0 12px 32px rgba(0, 212, 255, 0.4),
    0 0 30px rgba(0, 212, 255, 0.3);
}

.quantum-ai-assistant-icon {
  font-size: 24px;
  color: white;
  animation: quantum-pulse 2s infinite;
}

.quantum-ai-chat {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 400px;
  max-width: 90vw;
  background: var(--quantum-glass);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 12px 32px rgba(0, 212, 255, 0.2);
  z-index: 1001;
  overflow: hidden;
  animation: quantum-chat-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes quantum-chat-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.quantum-chat-header {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  padding: 16px 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantum-chat-title {
  font-size: 16px;
  font-weight: 600;
}

.quantum-chat-status {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: quantum-pulse 2s infinite;
}

.quantum-chat-messages {
  max-height: 300px;
  overflow-y: auto;
  padding: 20px;
}

.quantum-chat-message {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.quantum-chat-message.user {
  flex-direction: row-reverse;
}

.quantum-chat-bubble {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 12px 16px;
  max-width: 80%;
  position: relative;
}

.quantum-chat-message.user .quantum-chat-bubble {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  color: white;
  border: none;
}

.quantum-chat-input {
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  gap: 12px;
}

.quantum-chat-input-field {
  flex: 1;
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-size: 14px;
  outline: none;
}

.quantum-chat-send {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantum-chat-send:hover {
  transform: scale(1.05);
  box-shadow: 
    0 4px 16px rgba(0, 212, 255, 0.3),
    0 0 12px rgba(0, 212, 255, 0.2);
}
```

---

## 📅 **Booking System**

### **Booking Form - نموذج الحجز**
```css
.quantum-booking-form {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
  margin: 20px;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 212, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.quantum-booking-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.05), 
    rgba(139, 92, 246, 0.05));
  z-index: -1;
}

.quantum-booking-header {
  text-align: center;
  margin-bottom: 32px;
}

.quantum-booking-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--quantum-text-primary);
  margin-bottom: 8px;
}

.quantum-booking-subtitle {
  font-size: 14px;
  color: var(--quantum-text-secondary);
}

.quantum-booking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.quantum-booking-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantum-booking-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--quantum-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quantum-booking-input {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.quantum-booking-input:focus {
  outline: none;
  border-color: var(--quantum-primary);
  box-shadow: 
    0 0 0 3px rgba(0, 212, 255, 0.1),
    0 8px 24px rgba(0, 212, 255, 0.1);
}

.quantum-booking-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.quantum-booking-button {
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantum-booking-button.primary {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  color: white;
  border: none;
}

.quantum-booking-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2);
}

.quantum-booking-button.secondary {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--quantum-text-primary);
}

.quantum-booking-button.secondary:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-2px);
}
```

---

## 🎯 **Special Features**

### **Weather Widget - عنصر الطقس**
```css
.quantum-weather-widget {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 212, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.quantum-weather-widget::before {
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

.quantum-weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quantum-weather-location {
  font-size: 16px;
  font-weight: 600;
  color: var(--quantum-text-primary);
}

.quantum-weather-temp {
  font-size: 32px;
  font-weight: 700;
  color: var(--quantum-primary);
}

.quantum-weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quantum-weather-item {
  text-align: center;
}

.quantum-weather-label {
  font-size: 12px;
  color: var(--quantum-text-secondary);
  margin-bottom: 4px;
}

.quantum-weather-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--quantum-text-primary);
}
```

### **Currency Converter - محول العملات**
```css
.quantum-currency-converter {
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 4px 16px rgba(0, 212, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.quantum-currency-converter::before {
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

.quantum-currency-form {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: end;
}

.quantum-currency-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantum-currency-input {
  background: var(--quantum-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--quantum-text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
}

.quantum-currency-input:focus {
  outline: none;
  border-color: var(--quantum-primary);
  box-shadow: 
    0 0 0 3px rgba(0, 212, 255, 0.1),
    0 8px 24px rgba(0, 212, 255, 0.1);
}

.quantum-currency-swap {
  background: linear-gradient(135deg, 
    var(--quantum-primary), 
    var(--quantum-secondary));
  border: none;
  border-radius: 12px;
  padding: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantum-currency-swap:hover {
  transform: scale(1.05);
  box-shadow: 
    0 4px 16px rgba(0, 212, 255, 0.3),
    0 0 12px rgba(0, 212, 255, 0.2);
}
```

---

## 🎨 **App Navigation**

### **Bottom Navigation - التنقل السفلي**
```css
.quantum-travel-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--quantum-glass);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-around;
  z-index: 1000;
}

.quantum-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantum-nav-item::before {
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

.quantum-nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 24px rgba(0, 212, 255, 0.1),
    0 0 15px rgba(0, 212, 255, 0.05);
}

.quantum-nav-item:hover::before {
  opacity: 1;
}

.quantum-nav-item.active {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.quantum-nav-icon {
  font-size: 20px;
  color: var(--quantum-text-secondary);
  transition: all 0.3s ease;
}

.quantum-nav-item:hover .quantum-nav-icon {
  color: var(--quantum-primary);
  transform: scale(1.1);
}

.quantum-nav-item.active .quantum-nav-icon {
  color: var(--quantum-primary);
}

.quantum-nav-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--quantum-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.quantum-nav-item:hover .quantum-nav-label {
  color: var(--quantum-primary);
}

.quantum-nav-item.active .quantum-nav-label {
  color: var(--quantum-primary);
}
```

---

## 🎯 **Responsive Design**

### **Mobile Adaptations - التكيف مع الجوال**
```css
@media (max-width: 768px) {
  .quantum-travel-hero {
    padding: 24px 16px;
    margin: 16px;
  }
  
  .quantum-travel-title {
    font-size: 24px;
  }
  
  .quantum-search-form {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .quantum-destinations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .quantum-booking-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .quantum-ai-chat {
    width: 95vw;
    right: 2.5vw;
  }
  
  .quantum-travel-nav {
    padding: 12px 16px;
  }
  
  .quantum-nav-item {
    padding: 6px 12px;
  }
  
  .quantum-nav-icon {
    font-size: 18px;
  }
  
  .quantum-nav-label {
    font-size: 9px;
  }
}
```

### **Tablet Adaptations - التكيف مع التابلت**
```css
@media (min-width: 769px) and (max-width: 1024px) {
  .quantum-destinations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quantum-booking-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quantum-ai-chat {
    width: 350px;
  }
}
```

---

## 🌟 **Special Animations**

### **Loading States - حالات التحميل**
```css
.quantum-loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--quantum-primary);
  animation: quantum-spin 1s linear infinite;
}

@keyframes quantum-spin {
  to { transform: rotate(360deg); }
}

.quantum-loading-dots {
  display: flex;
  gap: 4px;
}

.quantum-loading-dot {
  width: 8px;
  height: 8px;
  background: var(--quantum-primary);
  border-radius: 50%;
  animation: quantum-bounce 1.4s infinite ease-in-out;
}

.quantum-loading-dot:nth-child(1) { animation-delay: -0.32s; }
.quantum-loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes quantum-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

### **Success Animation - رسوم النجاح**
```css
.quantum-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  color: #22c55e;
  font-weight: 600;
  animation: quantum-success-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes quantum-success-slide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quantum-success-icon {
  font-size: 20px;
  animation: quantum-success-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes quantum-success-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

*This is the complete AI Travel Agency app specification for Kombai AI Design System*
*Target: Revolutionary AI-powered travel platform*
*Goal: Create the most advanced travel booking experience*
