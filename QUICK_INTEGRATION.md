# 🎯 Quick Integration Guide

## Step-by-Step Integration for GB Coder

### 1️⃣ Install Dependencies (Already Done ✅)

```bash
npm install @google/generative-ai html-to-image react-hot-toast uuid
```

---

### 2️⃣ Add Imports to App.tsx

Add these lines at the **top** of `src/App.tsx` (after line 28):

```typescript
// ===== NEW FEATURES IMPORTS =====
import { Toaster } from 'react-hot-toast';
import { MessageSquare, Mic, LayoutTemplate, BarChart3, CheckCircle, Zap } from 'lucide-react';
import AIChatAssistant from './components/AIChatAssistant';
import ExportShareMenu from './components/ExportShareMenu';
import VoiceCommandPanel from './components/VoiceCommandPanel';
import TemplateSelectorModal from './components/TemplateSelectorModal';
import CodeStatsDashboard from './components/CodeStatsDashboard';
import ValidationPanel from './components/ValidationPanel';
import CustomInjectionManager from './components/CustomInjectionManager';
import { CodeTemplate } from './services/codeTemplatesService';
```

---

### 3️⃣ Add New State Variables

In the `App` component, after line 85 (after `showKeyboardShortcuts`), add:

```typescript
// ===== NEW FEATURES STATE =====
const [showAIChat, setShowAIChat] = useState(false);
const [showVoiceCommands, setShowVoiceCommands] = useState(false);
const [showTemplates, setShowTemplates] = useState(false);
const [showStats, setShowStats] = useState(false);
const [showValidation, setShowValidation] = useState(false);
const [showInjectionManager, setShowInjectionManager] = useState(false);
const [customInjectionCode, setCustomInjectionCode] = useState({ css: '', js: '' });
const previewRef = React.useRef<HTMLElement>(null);
```

---

### 4️⃣ Add Handler Functions

After the existing handlers (around line 350), add:

```typescript
// ===== NEW FEATURES HANDLERS =====
const handleLoadTemplate = useCallback((template: CodeTemplate) => {
  setHtml(template.html);
  setCss(template.css);
  setJavascript(template.javascript);
  toast.success(`Loaded template: ${template.name}`);
}, []);

const handleUpdateInjections = useCallback((css: string, js: string) => {
  setCustomInjectionCode({ css, js });
  toast.success('Custom injections updated');
}, []);
```

---

### 5️⃣ Update NavigationBar

In the main return statement (around line 950), update the NavigationBar to include new actions:

**Find this:**
```typescript
<NavigationBar
  onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
  onRun={() => handleCommand('run')}
  // ... other props
/>
```

**Replace with:**
```typescript
<NavigationBar
  onAutoSaveToggle={() => setAutoSaveEnabled(!autoSaveEnabled)}
  onRun={() => handleCommand('run')}
  onImport={fileUpload.uploadFiles}
  onExport={() => downloadAsZip(html, css, javascript)}
  onExternalLibraryManagerToggle={handleExternalLibraryManagerToggle}
  onSettingsToggle={handleSettingsToggle}
  onClear={handleClearAll}
  autoSaveEnabled={autoSaveEnabled}
  customActions={
    <div className="flex items-center gap-1 sm:gap-2">
      {/* AI Chat */}
      <button
        onClick={() => setShowAIChat(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="AI Chat Assistant"
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Voice Commands */}
      <button
        onClick={() => setShowVoiceCommands(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="Voice Commands"
      >
        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Templates */}
      <button
        onClick={() => setShowTemplates(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="Code Templates"
      >
        <LayoutTemplate className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Statistics */}
      <button
        onClick={() => setShowStats(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="Code Statistics"
      >
        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Validation */}
      <button
        onClick={() => setShowValidation(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="Code Validation"
      >
        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Custom Injection */}
      <button
        onClick={() => setShowInjectionManager(true)}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
        }`}
        title="Custom Code Injection"
      >
        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Export/Share Menu */}
      <ExportShareMenu
        previewRef={previewRef}
        html={html}
        css={css}
        javascript={javascript}
        externalLibraries={externalLibraries}
      />
    </div>
  }
/>
```

---

### 6️⃣ Pass Custom Injection to Preview

Find the `TabbedRightPanel` component (around line 1020) and update:

**Find:**
```typescript
<TabbedRightPanel
  html={html}
  css={css}
  javascript={javascript}
  // ... other props
/>
```

**Replace with:**
```typescript
<TabbedRightPanel
  ref={previewRef}
  html={html}
  css={css + (customInjectionCode.css ? '\n\n/* Custom Injections */\n' + customInjectionCode.css : '')}
  javascript={javascript + (customInjectionCode.js ? '\n\n// Custom Injections\n' + customInjectionCode.js : '')}
  // ... keep other props
/>
```

**Note:** You may need to add `React.forwardRef` to `TabbedRightPanel` to accept the ref.

---

### 7️⃣ Add Toast Notifications

Before the closing `</div>` of the App component (at the very end), add:

```typescript
{/* Toast Notifications */}
<Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: isDark ? '#1a1a1a' : '#fff',
      color: isDark ? '#fff' : '#000',
      border: `1px solid ${isDark ? '#333' : '#eee'}`,
    },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
  }}
/>
```

---

### 8️⃣ Add Modal Components

Before the Toast (same location as step 7), add all the modal components:

```typescript
{/* ===== NEW FEATURES MODALS ===== */}

{/* AI Chat Assistant */}
<AIChatAssistant
  isOpen={showAIChat}
  onClose={() => setShowAIChat(false)}
  html={html}
  css={css}
  javascript={javascript}
  externalLibraries={externalLibraries}
/>

{/* Voice Command Panel */}
<VoiceCommandPanel
  isOpen={showVoiceCommands}
  onClose={() => setShowVoiceCommands(false)}
/>

{/* Template Selector */}
<TemplateSelectorModal
  isOpen={showTemplates}
  onClose={() => setShowTemplates(false)}
  onLoadTemplate={handleLoadTemplate}
/>

{/* Code Statistics Dashboard */}
<CodeStatsDashboard
  html={html}
  css={css}
  javascript={javascript}
  isOpen={showStats}
  onClose={() => setShowStats(false)}
/>

{/* Validation Panel */}
<ValidationPanel
  html={html}
  css={css}
  javascript={javascript}
  isOpen={showValidation}
  onClose={() => setShowValidation(false)}
/>

{/* Custom Injection Manager */}
<CustomInjectionManager
  isOpen={showInjectionManager}
  onClose={() => setShowInjectionManager(false)}
  onUpdateInjections={handleUpdateInjections}
/>
```

---

### 9️⃣ Add Voice Command Event Listener

Add this `useEffect` after the existing effects (around line 500):

```typescript
// Voice command handler
useEffect(() => {
  const handleVoiceCommand = (event: CustomEvent) => {
    const { action, param } = event.detail;
    
    switch (action) {
      case 'run':
        handleCommand('run');
        toast.success('Running code...');
        break;
      case 'clear_console':
        clearConsoleLogs();
        toast.success('Console cleared');
        break;
      case 'format':
        handleFormatHtml();
        handleFormatCss();
        handleFormatJavascript();
        toast.success('Code formatted');
        break;
      case 'download':
        downloadAsZip(html, css, javascript);
        toast.success('Downloading project...');
        break;
      case 'help':
        setShowVoiceCommands(true);
        break;
    }
  };

  window.addEventListener('voice-command', handleVoiceCommand as EventListener);
  return () => window.removeEventListener('voice-command', handleVoiceCommand as EventListener);
}, [html, css, javascript]);
```

---

### 🔟 Update TabbedRightPanel (Optional)

To properly support the preview ref, you may need to update `TabbedRightPanel.tsx`:

```typescript
// At the top of TabbedRightPanel component
interface TabbedRightPanelProps {
  // ... existing props
}

// Update the component declaration
const TabbedRightPanel = React.forwardRef<HTMLElement, TabbedRightPanelProps>((
  props,
  ref
) => {
  // Wrap the preview panel with the ref
  return (
    <div className="...">
      {/* Find the PreviewPanel and add ref */}
      <PreviewPanel ref={ref} {...otherProps} />
      {/* ... rest of component */}
    </div>
  );
});

export default TabbedRightPanel;
```

---

### ✅ Test Your Integration

1. Run the dev server:
   ```bash
   npm run dev
   ```

2. Test each feature:
   - Click each new icon in the navigation bar
   - Try the AI Chat with a question
   - Test voice commands (Chrome/Edge only)
   - Load a template
   - View statistics
   - Run validation
   - Apply a custom injection
   - Take a screenshot

---

## 🎨 Navigation Bar Layout

Your navigation bar will now have these new buttons (right to left):

```
[Logo] [GB Coder] ........ [Export] [Zap] [✓] [📊] [📐] [🎤] [💬] [Settings]
```

---

## 🐛 Common Issues

### "Module not found" errors
- Make sure all new files exist in the correct locations
- Run `npm install` again

### Toast not showing
- Ensure `Toaster` is inside the main div
- Check that `react-hot-toast` is installed

### Preview ref not working
- Update `TabbedRightPanel` to use `forwardRef`
- Pass the ref to `PreviewPanel`

### Voice commands not working
- Use Chrome or Edge browser
- Allow microphone permissions when prompted

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all imports are correct
3. Ensure state variables are properly declared
4. Test one feature at a time

---

**Happy Coding! 🚀**
