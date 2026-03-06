# 🧪 GB Coder - New Features Testing Guide

## ✅ Development Server Status

**Server:** Running at `http://localhost:5173`

---

## 🎯 Feature Testing Checklist

### 1. AI Chat Assistant 💬

**How to Test:**
1. Open `http://localhost:5173`
2. Click the **MessageSquare** icon in navigation bar
3. Wait for modal to open
4. Type a question like "Explain my HTML code"
5. Press Enter or click Send
6. Check if AI responds with explanation

**Expected Results:**
- ✅ Modal opens smoothly
- ✅ Chat interface appears
- ✅ Quick action suggestions visible
- ✅ AI responds to questions
- ✅ Code blocks are formatted correctly
- ✅ Copy button works on code blocks

**Requirements:**
- `VITE_GEMINI_API_KEY` must be set in `.env`

**Test Questions:**
```
- Explain what my CSS does
- How can I improve this JavaScript?
- Generate a button with hover effect
- Why is my flexbox not centering?
- Refactor this code to be more readable
```

---

### 2. Export & Share Menu 📸

**How to Test:**
1. Click the **Camera** icon in navigation bar
2. Dropdown menu should appear

**Test Each Option:**

#### Screenshot - PNG
- Click "Save as PNG"
- File should download as `gb-coder-screenshot.png`
- Check image quality and watermark

#### Screenshot - JPEG
- Click "Save as JPEG"
- File should download as `gb-coder-screenshot.jpeg`

#### Screenshot - SVG
- Click "Save as SVG"
- File should download as `gb-coder-screenshot.svg`

#### Copy to Clipboard
- Click "Copy to Clipboard"
- Paste in an image editor to verify

#### Export as HTML
- Click "Export as HTML"
- `index.html` should download
- Open in browser to verify

#### Export as ZIP
- Click "Export as ZIP"
- `gb-coder-project.zip` should download
- Extract and check files:
  - index.html
  - style.css
  - script.js
  - README.md

#### Generate Share URL
- Click "Generate Share URL"
- URL should be copied to clipboard
- Paste in new tab to verify code loads

#### Export to CodePen
- Click "Export to CodePen"
- New tab should open with CodePen

#### Export to JSFiddle
- Click "Export to JSFiddle"
- New tab should open with JSFiddle

---

### 3. Voice Commands 🎤

**How to Test:**
1. Click the **Mic** icon in navigation bar
2. Modal opens showing available commands
3. Click "Start Listening"
4. Allow microphone permission if prompted
5. Say one of these commands:

**Voice Commands to Test:**
```
- "Run the code"
- "Clear console"
- "Format code"
- "Download"
- "Help"
```

**Expected Results:**
- ✅ Microphone permission prompt appears
- ✅ "Listening..." indicator shows
- ✅ Command executes when recognized
- ✅ Toast notification appears
- ✅ Statistics update after each command

**Browser Requirements:**
- Chrome ✅
- Edge ✅
- Firefox ❌ (not supported)
- Safari ❌ (not supported)

---

### 4. Code Templates 📐

**How to Test:**
1. Click the **LayoutTemplate** icon
2. Template selector modal opens

**Test Features:**
- ✅ Search bar works
- ✅ Category filters work (All, Components, Layouts, etc.)
- ✅ Difficulty filter works
- ✅ Template cards display correctly
- ✅ Click "Load Template" replaces current code
- ✅ Toast notification appears

**Templates to Test:**
1. **Responsive Navigation Bar** - Component
2. **Hero Section with CTA** - Layout
3. **Responsive Card Grid** - Component
4. **Animated Counter** - Animation
5. **Contact Form** - Component
6. **Dark Mode Toggle** - Utility

**After Loading:**
- Check if HTML/CSS/JS all load correctly
- Run the code to see preview
- Verify responsive design works

---

### 5. Code Statistics 📊

**How to Test:**
1. Click the **BarChart3** icon
2. Dashboard modal opens

**Check Each Section:**

#### Overview Cards
- ✅ Total Lines count is accurate
- ✅ Total Characters count is accurate
- ✅ HTML Tags count is accurate
- ✅ JS Functions count is accurate

#### Language Breakdown
- ✅ HTML bar shows correct percentage
- ✅ CSS bar shows correct percentage
- ✅ JavaScript bar shows correct percentage
- ✅ Progress bar at bottom matches

#### Code Patterns
- ✅ HTML Tags detected
- ✅ CSS Rules detected
- ✅ JS Functions detected
- ✅ JS Classes detected

#### Complexity Analysis
- ✅ HTML complexity rated (Low/Medium/High)
- ✅ CSS complexity rated
- ✅ JavaScript complexity rated
- ✅ Read time estimated

**Test with Different Code:**
- Load a template to see stats change
- Add more code to see real-time updates

---

### 6. Code Validation ✅

**How to Test:**
1. Click the **CheckCircle** icon
2. Validation panel opens

**Check Each Section:**

#### Score Display
- ✅ Quality score shows (0-100)
- ✅ Status badge shows (Excellent/Good/Needs Work)
- ✅ Icon color matches score

#### Stats Cards
- ✅ Errors count (red)
- ✅ Warnings count (yellow)
- ✅ Info count (blue)

#### Error List
- ✅ Errors displayed with line numbers
- ✅ Severity icons correct
- ✅ Source badges (HTML/CSS/JS)
- ✅ Filter by severity works
- ✅ Filter by source works

**Test Validation Rules:**

**HTML Tests:**
```html
<!-- Missing alt attribute -->
<img src="test.jpg">

<!-- Unclosed tag -->
<div class="test">

<!-- Deprecated tag -->
<font size="4">Test</font>

<!-- Inline style -->
<div style="color: red;">Test</div>
```

**CSS Tests:**
```css
/* Unclosed brace */
.test {
  color: red;

/* !important overuse */
.a { color: red !important; }
.b { color: blue !important; }
.c { color: green !important; }
.d { color: yellow !important; }
.e { color: purple !important; }
.f { color: orange !important; }
```

**JavaScript Tests:**
```javascript
// console.log
console.log("test");

// var instead of let/const
var x = 10;

// == instead of ===
if (x == 10) {}

// debugger
debugger;

// eval
eval("code");
```

---

### 7. Custom Code Injection 🎨

**How to Test:**
1. Click the **Zap** icon
2. Custom Injection Manager opens

**Test Presets Tab:**
- ✅ Search presets works
- ✅ Category sections display
- ✅ Can add presets (click "Add")
- ✅ Selected count updates

**Test Custom Tab:**
- ✅ Click "Add Custom Injection"
- ✅ Form appears
- ✅ Fill in name, type, code
- ✅ Save works
- ✅ Custom injection appears in list
- ✅ Toggle enable/disable works
- ✅ Delete works

**Apply Injections:**
1. Select some presets (e.g., "Smooth Scrolling")
2. Click "Apply" button
3. Check if preview updates
4. Run code to see effect

**Presets to Test:**
- CSS Reset
- Smooth Scrolling
- Custom Text Selection
- Enhanced Focus Outline
- Debug Layout Borders
- Bounce Animation
- Console Timer
- Click Ripple Effect

---

### 8. Toast Notifications 🍞

**How to Test:**
Perform actions that trigger toasts:

**Actions:**
- Load a template → "Loaded template: [name]"
- Take screenshot → "Screenshot saved as PNG"
- Copy to clipboard → "Copied to clipboard!"
- Apply injections → "Injections applied"
- Validation check → Score notification

**Expected Results:**
- ✅ Toast appears in top-right corner
- ✅ Correct icon (success/error)
- ✅ Auto-dismisses after 3 seconds
- ✅ Dark/light mode matches theme
- ✅ Multiple toasts stack correctly

---

### 9. Responsive Design 📱

**How to Test:**

#### Desktop (>1024px)
- ✅ All 7 buttons visible in navbar
- ✅ Modals are centered and sized correctly
- ✅ Grid layouts work properly

#### Tablet (768px - 1024px)
- ✅ All buttons visible
- ✅ Modals adapt to screen size
- ✅ Forms are usable

#### Mobile (<768px)
- ✅ Icon buttons hidden (responsive)
- ✅ Export button still visible
- ✅ Modals full-screen or adapted
- ✅ Touch targets large enough

**Test Method:**
1. Open DevTools (F12)
2. Toggle device toolbar
3. Select different devices
4. Test each feature

---

### 10. Theme Support 🌓

**How to Test:**

#### Dark Mode
- ✅ All modals have dark background
- ✅ Text is readable (white/light gray)
- ✅ Borders are visible
- ✅ Code blocks have dark background

#### Light Mode
- ✅ All modals have light background
- ✅ Text is readable (dark gray/black)
- ✅ Borders are visible
- ✅ Code blocks have light background

#### Theme Switching
- Switch theme while modal is open
- Modal should update immediately
- No visual glitches

---

## 🐛 Common Issues & Solutions

### Issue: AI Chat shows error
**Solution:** Check `.env` file has valid `VITE_GEMINI_API_KEY`

### Issue: Voice commands not working
**Solution:** 
- Use Chrome or Edge
- Allow microphone permission
- Check microphone is connected

### Issue: Screenshot is blank
**Solution:**
- Wait for preview to fully load
- Check for CORS issues with images
- Try different format

### Issue: Template doesn't load
**Solution:**
- Check browser console for errors
- Verify template service is imported
- Reload page and try again

### Issue: Toast not showing
**Solution:**
- Verify `react-hot-toast` is installed
- Check Toaster component in App.tsx
- Look for console errors

### Issue: Modal doesn't close
**Solution:**
- Click X button in top-right
- Click outside modal (if supported)
- Check onClose handler

---

## 📊 Performance Testing

### Load Time
- Initial page load: < 3 seconds
- Modal open time: < 500ms
- Template load: < 1 second

### Memory Usage
- Check DevTools Memory tab
- Should not increase continuously
- Modals should clean up after close

### Bundle Size
- Check DevTools Network tab
- Initial load: ~500KB
- Lazy-loaded chunks load on demand

---

## ✅ Final Checklist

After testing all features:

- [ ] AI Chat works with API key
- [ ] Export/Share all options work
- [ ] Voice commands recognized
- [ ] Templates load correctly
- [ ] Statistics display accurately
- [ ] Validation catches errors
- [ ] Custom injection applies
- [ ] Toast notifications appear
- [ ] Responsive on all devices
- [ ] Theme switching works
- [ ] No console errors
- [ ] No memory leaks
- [ ] Build passes without errors

---

## 🎯 Success Criteria

**All features pass if:**
1. ✅ No JavaScript errors in console
2. ✅ All modals open and close properly
3. ✅ All buttons trigger correct actions
4. ✅ UI is responsive on all screen sizes
5. ✅ Theme switching works smoothly
6. ✅ Toast notifications appear
7. ✅ Build completes without errors
8. ✅ Performance is acceptable

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Browser: ___________

Feature Tests:
[ ] AI Chat - Pass/Fail - Notes: _______
[ ] Export/Share - Pass/Fail - Notes: _______
[ ] Voice Commands - Pass/Fail - Notes: _______
[ ] Templates - Pass/Fail - Notes: _______
[ ] Statistics - Pass/Fail - Notes: _______
[ ] Validation - Pass/Fail - Notes: _______
[ ] Custom Injection - Pass/Fail - Notes: _______
[ ] Toast Notifications - Pass/Fail - Notes: _______
[ ] Responsive Design - Pass/Fail - Notes: _______
[ ] Theme Support - Pass/Fail - Notes: _______

Overall Status: Pass/Fail
Issues Found: ________________
Recommendations: ________________
```

---

## 🚀 Next Steps After Testing

1. Fix any bugs found during testing
2. Optimize performance if needed
3. Update documentation with findings
4. Prepare for production deployment
5. Gather user feedback

---

**Happy Testing! 🧪**
