# 🎨 GB Coder - Navigation Bar Visual Guide

## 📍 New Button Layout

### Desktop View (>640px)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] GB Coder    ............    [💬] [🎤] [📐] [📊] [✅] [⚡] [📸] [⚙️] [☀️/🌙]        │
│                                                                                             │
│  Legend:                                                                                    │
│  [💬] = AI Chat Assistant      (MessageSquare icon)                                        │
│  [🎤] = Voice Commands         (Mic icon)                                                   │
│  [📐] = Code Templates         (LayoutTemplate icon)                                        │
│  [📊] = Code Statistics        (BarChart3 icon)                                             │
│  [✅] = Code Validation        (CheckCircle icon)                                           │
│  [⚡] = Custom Injection       (Zap icon)                                                   │
│  [📸] = Export & Share         (Camera icon - dropdown menu)                                │
│  [⚙️] = Settings                                                                            │
│  [☀️/🌙] = Theme Toggle                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile View (<640px)

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] GB Coder              [📸] [⚙️] [☀️/🌙]          │
│                                                         │
│  Note: Icon buttons hidden on mobile for space          │
│        Export button always visible                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Button Details

### 1. 💬 AI Chat Assistant (MessageSquare)

**Position:** First button after logo section
**Icon:** MessageSquare from lucide-react
**Color:** Gray (hover: purple/blue gradient)
**Action:** Opens AI chat modal
**Tooltip:** "AI Chat Assistant"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  ✨ AI Code Assistant                              [X]   │
│  Powered by Google Gemini AI                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Chat interface with message history]                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Ask anything about your code...           [➤]   │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

### 2. 🎤 Voice Commands (Mic)

**Position:** Second button
**Icon:** Mic from lucide-react
**Color:** Gray (hover: purple when active)
**Action:** Opens voice command panel
**Tooltip:** "Voice Commands"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  🎤 Voice Commands                   [Start] [X]         │
│  Listening... Speak a command                            │
├──────────────────────────────────────────────────────────┤
│  Commands Executed: 5                                    │
│  Last Command: "Run the code"                            │
├──────────────────────────────────────────────────────────┤
│  Available Commands:                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │ "Run the code" / "Execute" / "Show preview"        │ │
│  │ "Clear console" / "Clear output"                   │ │
│  │ "Format code" / "Beautify"                         │ │
│  │ ...                                                │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 3. 📐 Code Templates (LayoutTemplate)

**Position:** Third button
**Icon:** LayoutTemplate from lucide-react
**Color:** Gray (hover: purple/blue)
**Action:** Opens template selector
**Tooltip:** "Code Templates"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  📐 Code Templates                                   [X] │
│  Pre-built templates to jumpstart your project           │
├──────────────────────────────────────────────────────────┤
│  [Search templates...]  [All] [Components] [Layouts]... │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Responsive   │ │ Hero Section │ │ Card Grid    │    │
│  │ Navbar       │ │ with CTA     │ │              │    │
│  │ [Load] [📋] │ │ [Load] [📋] │ │ [Load] [📋] │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

### 4. 📊 Code Statistics (BarChart3)

**Position:** Fourth button
**Icon:** BarChart3 from lucide-react
**Color:** Gray (hover: purple/blue)
**Action:** Opens statistics dashboard
**Tooltip:** "Code Statistics"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  📊 Code Statistics                                  [X] │
│  Real-time analytics of your code                        │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 📝 150  │ │ 📄 2.5K │ │ 🏷️ 45   │ │ ⚡ 12    │       │
│  │  Lines  │ │  Chars  │ │  Tags   │ │  Func   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├──────────────────────────────────────────────────────────┤
│  Language Breakdown:                                     │
│  HTML  ████████░░░░░░░░░░░░ 40%  (60 lines)             │
│  CSS   ██████░░░░░░░░░░░░░░ 30%  (45 lines)             │
│  JS    ██████████░░░░░░░░░░ 30%  (45 lines)             │
└──────────────────────────────────────────────────────────┘
```

---

### 5. ✅ Code Validation (CheckCircle)

**Position:** Fifth button
**Icon:** CheckCircle from lucide-react
**Color:** Gray (hover: green/purple)
**Action:** Opens validation panel
**Tooltip:** "Code Validation"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  ✅ Code Validation                                  [X] │
│  Score: 85/100  [✓ Good]                                 │
├──────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│  │ 🔴 2    │ │ 🟡 5    │ │ 🔵 8    │                    │
│  │ Errors  │ │ Warning │ │ Info    │                    │
│  └─────────┘ └─────────┘ └─────────┘                    │
├──────────────────────────────────────────────────────────┤
│  Filter: [All Severities ▼] [All Sources ▼]             │
├──────────────────────────────────────────────────────────┤
│  🔴 Image missing alt attribute (Line 15, HTML)          │
│  🟡 Use === instead of == (Line 23, JavaScript)          │
│  🔵 Consider adding vendor prefixes (Line 10, CSS)       │
└──────────────────────────────────────────────────────────┘
```

---

### 6. ⚡ Custom Injection (Zap)

**Position:** Sixth button
**Icon:** Zap from lucide-react
**Color:** Gray (hover: purple/blue)
**Action:** Opens injection manager
**Tooltip:** "Custom Code Injection"

**When Clicked:**
```
┌──────────────────────────────────────────────────────────┐
│  ⚡ Custom Code Injection        [Apply] [X]             │
│  Add custom CSS/JS to your preview                       │
├──────────────────────────────────────────────────────────┤
│  [Custom (3)] [Presets (14)]                            │
├──────────────────────────────────────────────────────────┤
│  Presets:                                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📖 CSS Reset                                       │ │
│  │    Basic CSS reset for consistent styling   [Add]  │ │
│  │ 📖 Smooth Scrolling                                │ │
│  │    Enable smooth scrolling for the page    [Add]  │ │
│  │ 📖 Debug Layout Borders                            │ │
│  │    Show borders on all elements           [Add]  │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 7. 📸 Export & Share (Camera)

**Position:** Seventh button (always visible)
**Icon:** Camera from lucide-react
**Color:** Gray (hover: purple/blue)
**Action:** Opens dropdown menu
**Tooltip:** "Export & Share"

**When Clicked:**
```
┌──────────────────────────────────────────┐
│  📸 Screenshot                           │
│  ├─ Save as PNG                          │
│  ├─ Save as JPEG                         │
│  ├─ Save as SVG                          │
│  └─ Copy to Clipboard                    │
├──────────────────────────────────────────┤
│  📤 Export                               │
│  ├─ Export as HTML                       │
│  └─ Export as ZIP                        │
├──────────────────────────────────────────┤
│  🔗 Share                                │
│  ├─ Generate Share URL                   │
│  ├─ Export to CodePen                    │
│  └─ Export to JSFiddle                   │
└──────────────────────────────────────────┘
```

---

## 🎨 Button States

### Default State
```
┌─────┐
│  💬  │  Gray background, gray icon
└─────┘
```

### Hover State
```
┌─────┐
│  💬  │  Darker background, colored icon
└─────┘
```

### Active/Open State
```
┌─────┐
│  💬  │  Purple/blue gradient background
└─────┘
```

### Disabled State
```
┌─────┐
│  💬  │  Opacity 50%, cursor not-allowed
└─────┘
```

---

## 📐 Spacing & Dimensions

### Button Size
```
Desktop: 40px × 40px (icon: 20px × 20px)
Mobile:  36px × 36px (icon: 18px × 18px)
```

### Spacing
```
Between buttons: 4px (sm), 8px (md+)
Padding: 8px (all sides)
Border radius: 8px (rounded-lg)
```

### Gap from Logo
```
Left section to buttons: Auto (flex-grow)
Between button groups: 16px
```

---

## 🎭 Animations

### Hover Animation
```css
transition: all 0.2s ease;
transform: scale(1.05);
```

### Click Animation
```css
transform: scale(0.95);
```

### Modal Open Animation
```css
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

---

## 🌙 Theme Variations

### Dark Mode
```
Background: #1a1a1a (gray-900)
Hover: #2d2d2d (gray-800)
Text: #e5e5e5 (gray-200)
Border: #404040 (gray-700)
```

### Light Mode
```
Background: #ffffff
Hover: #f3f4f6 (gray-100)
Text: #374151 (gray-700)
Border: #e5e7eb (gray-200)
```

---

## 📱 Responsive Behavior

### Screen Width > 1024px (Desktop)
- All 7 feature buttons visible
- Full size (40px × 40px)
- Tooltips on hover

### Screen Width 640px - 1024px (Tablet)
- All 7 feature buttons visible
- Slightly smaller (36px × 36px)
- Tooltips always hidden

### Screen Width < 640px (Mobile)
- Feature buttons hidden (display: none)
- Only Export button visible
- Settings and Theme toggle visible
- Hamburger menu option (future)

---

## 🎯 Accessibility

### Keyboard Navigation
```
Tab: Move between buttons
Enter/Space: Activate button
Escape: Close modal
```

### ARIA Attributes
```html
<button 
  aria-label="AI Chat Assistant"
  title="AI Chat Assistant"
  role="button"
>
```

### Focus States
```css
:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
```

---

## 🎨 Color Palette

### Primary Gradient
```
from: #667eea (purple-500)
to: #764ba2 (purple-600)
```

### Icon Colors
```
Default: #9ca3af (gray-400)
Hover: #e5e7eb (gray-200)
Active: #ffffff (white)
```

### Background Colors
```
Dark: #1a1a1a (gray-900)
Light: #ffffff
Hover Dark: #2d2d2d (gray-800)
Hover Light: #f3f4f6 (gray-100)
```

---

**Visual Guide Complete! 🎨**

Use this guide to understand the layout, styling, and behavior of all new navigation bar buttons.
