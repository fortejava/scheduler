# 🧪 CSS ANCHOR POSITIONING - COMPREHENSIVE TEST PROTOCOL

**Date:** 2025-11-20
**Implementation:** CSS Anchor Positioning API + OddBird Polyfill
**Browser:** [Fill in during testing]
**Version:** [Fill in during testing]

---

## 📋 PRE-TESTING CHECKLIST

### **Before Opening Application:**

- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh (Ctrl+Shift+R) after loading
- [ ] Open DevTools Console (F12) to monitor messages
- [ ] Check for polyfill load messages in console

### **Expected Console Messages:**

**Modern Browsers (Chrome 125+, Safari 26+):**
```
[Anchor Positioning] Natively supported - no polyfill needed
```

**Firefox / Older Browsers:**
```
[Anchor Positioning] Not natively supported - loading polyfill...
[Anchor Positioning] Polyfill loaded successfully from local file
```

**If error:** Check that `WebSite/assets/js/css-anchor-positioning.js` exists

---

## 🎯 CRITICAL TEST CASES

### **TEST 1: Day View Popover (Previously Working)** ⭐ **MUST PASS**

**Objective:** Ensure we didn't break what was working

**Steps:**
1. Navigate to calendar
2. Switch to **Day View** (click "Giorno" button)
3. Find any day with "+N more" link
4. Click the link

**Expected Results:**
- ✅ Popover opens (below day number OR above if no space below)
- ✅ **White background** (not transparent)
- ✅ All invoices visible
- ✅ Scrollbar functional if many invoices
- ✅ **NO cutoff at bottom**
- ✅ Fits within viewport

**If FAILS:**
→ Anchor positioning not working
→ Check console for errors
→ Verify polyfill loaded

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 2: Month View Today (2025-11-20)** ⭐ **CRITICAL**

**Objective:** Verify transparent background fixed + positioning works

**Steps:**
1. Navigate to calendar
2. Ensure **Month View** is active
3. Navigate to **November 2025**
4. Find **today** (20 November 2025)
5. Click "+N more"

**Expected Results:**
- ✅ **WHITE background** (not transparent) - KEY FIX
- ✅ Positioned below day cell (or above if near bottom)
- ✅ Header shows "20 novembre 2025"
- ✅ All invoices visible via scrolling
- ✅ Fits within viewport
- ✅ Can scroll to last invoice

**If FAILS:**
→ Background still transparent = CSS not applying
→ Hard refresh browser (Ctrl+Shift+R)

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 3: Month View Regular Day (2025-11-18)** ⭐ **SHOULD PASS**

**Objective:** Verify middle-of-month positioning

**Steps:**
1. Month view, November 2025
2. Find **18 November** (Tuesday - middle of month)
3. Click "+N more"

**Expected Results:**
- ✅ Opens **below** day cell (not near bottom)
- ✅ Fully visible (no cutoff on right or bottom)
- ✅ All 20 overdue invoices visible via scrolling
- ✅ Red colored events visible
- ✅ Amounts like "€12.3K", "€12.4K" visible

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 4: Month View Last Week (2025-11-30)** ⭐⭐⭐ **MOST CRITICAL**

**Objective:** THE MAIN PROBLEM CASE - Bottom row positioning

**This is the KEY test - if this works, the solution succeeded!**

**Steps:**
1. Month view, November 2025
2. Find **30 November** (Sunday - LAST ROW, bottom-right)
3. Click "+N more"

**Expected Results:**
- ✅ **Automatically opens ABOVE day cell** (flip-block fallback!)
- ✅ OR repositions to fit within viewport
- ✅ **NO bottom cutoff** (THIS WAS THE MAIN PROBLEM!)
- ✅ All invoices accessible via scrolling
- ✅ Can scroll to LAST invoice
- ✅ Max height = 80% of viewport height (80svh)

**Critical Check:**
```
Popover should NOT extend below screen bottom
User should be able to scroll to see ALL invoices
No invoices should be cut off or inaccessible
```

**If PASSES:** 🎉 **SUCCESS! Problem solved!**

**If FAILS:**
→ Check console for errors
→ Inspect popover position in DevTools
→ Check if `position-area: top` was applied (fallback triggered)
→ May need to adjust fallback order in CSS

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 5: Week View Popover** ⭐ **SHOULD IMPROVE**

**Objective:** Verify week view also benefits from anchor positioning

**Steps:**
1. Switch to **Week View** ("Settimana")
2. Find any day with many invoices
3. Click "+N more"

**Expected Results:**
- ✅ Positioned appropriately (below or above based on space)
- ✅ Fits within viewport
- ✅ Scrollable
- ✅ No cutoff

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 6: First Day of Month (Top-Left)** 📍 **EDGE CASE**

**Objective:** Test corner positioning

**Steps:**
1. Month view
2. Click "+N more" on **day 1** (top-left corner)

**Expected Results:**
- ✅ Opens below and to right
- ✅ Fits within viewport

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 7: Last Day of Month (Bottom-Right)** 📍 **EDGE CASE**

**Objective:** Test opposite corner

**Steps:**
1. Month view
2. Click "+N more" on **day 30** (bottom-right corner)

**Expected Results:**
- ✅ Opens above and to left (diagonal flip!)
- ✅ Fits within viewport

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 8: Scrolled Page** 📜 **EDGE CASE**

**Objective:** Verify fixed positioning works when scrolled

**Steps:**
1. Scroll calendar partially off screen (scroll down)
2. Click "+N more" on any day

**Expected Results:**
- ✅ Popover stays within viewport (fixed positioning)
- ✅ Doesn't scroll with page

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

## 📱 RESPONSIVE TESTING

### **TEST 9: Tablet View (768x1024)**

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPad or custom size: 768x1024
4. Click "+N more" on any day

**Expected Results:**
- ✅ Max-height: 70svh (should be ~700px)
- ✅ Fits within viewport
- ✅ Scrollable

**DevTools Check:**
```css
Computed Style:
max-height: ~700px (70% of 1024px)
```

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

### **TEST 10: Mobile View (375x667)**

**Steps:**
1. DevTools responsive mode
2. Select iPhone SE or custom: 375x667
3. Click "+N more"

**Expected Results:**
- ✅ Max-height: 60svh (should be ~400px)
- ✅ Fits within smaller viewport
- ✅ Scrollable
- ✅ Touch scrolling works smoothly

**DevTools Check:**
```css
Computed Style:
max-height: ~400px (60% of 667px)
```

**Status:** ⏳ PENDING
**Result:** ________________
**Notes:** ________________

---

## 🔍 DEVTOOLS INSPECTION

### **Verify CSS Application:**

**Steps:**
1. Open popover
2. Right-click popover → Inspect Element
3. Check **Computed** tab

**Expected Styles:**

```css
/* Popover element */
position: fixed;
position-anchor: --calendar-day;
position-area: bottom; /* or "top" if flipped */
max-height: 864px; /* 80svh on 1080px screen */
background-color: rgb(255, 255, 255); /* WHITE */
z-index: 9999;
```

**Check Day Cell:**

```css
/* Day cell element */
anchor-name: --calendar-day;
```

**Screenshot recommended:** Save screenshot of computed styles

---

## 🎨 VISUAL VERIFICATION

### **Colors Test:**

Open any popover and verify event colors:

- 🟢 **Green** - Paid invoices (StatusCode "0")
- 🟡 **Yellow** - Pending invoices (StatusCode "1")
- 🔴 **Red** - Overdue invoices (StatusCode "2")

**Status:** ⏳ PENDING
**Result:** ________________

### **Scrollbar Test:**

Check custom scrollbar appearance:

- ✅ 10px wide
- ✅ Gray track (#f1f1f1)
- ✅ Dark blue thumb (#002c3d)
- ✅ Hover effect (darker shade)

**Status:** ⏳ PENDING
**Result:** ________________

---

## 📊 SUMMARY SCORECARD

| Test | Priority | Status | Pass/Fail |
|------|----------|--------|-----------|
| 1. Day View | ⭐ MUST | ⏳ | |
| 2. Today (2025-11-20) | ⭐ CRITICAL | ⏳ | |
| 3. Regular Day (2025-11-18) | ⭐ SHOULD | ⏳ | |
| **4. Last Week (2025-11-30)** | **⭐⭐⭐ KEY** | ⏳ | |
| 5. Week View | ⭐ SHOULD | ⏳ | |
| 6. First Day (Top-Left) | 📍 EDGE | ⏳ | |
| 7. Last Day (Bottom-Right) | 📍 EDGE | ⏳ | |
| 8. Scrolled Page | 📍 EDGE | ⏳ | |
| 9. Tablet (768x1024) | 📱 RESPONSIVE | ⏳ | |
| 10. Mobile (375x667) | 📱 RESPONSIVE | ⏳ | |

**Total Tests:** 10
**Passed:** ___ / 10
**Failed:** ___ / 10

---

## ✅ PASS CRITERIA

**Minimum requirements to consider implementation successful:**

1. ✅ **Test 4 (Last Week) MUST PASS** - This was the main problem
2. ✅ **Test 1 (Day View) MUST PASS** - Don't break what worked
3. ✅ **Test 2 (Today) MUST PASS** - Fix transparent background
4. ✅ At least **8 out of 10** tests pass

**If criteria not met:** See rollback instructions in `ANCHOR_POSITIONING_BACKUP_BEFORE.md`

---

## 🐛 TROUBLESHOOTING

### **Problem: Polyfill not loading**

**Console shows:** No anchor positioning messages

**Solution:**
1. Check file exists: `WebSite/assets/js/css-anchor-positioning.js`
2. Check file size: Should be ~182KB
3. Hard refresh (Ctrl+Shift+R)
4. Check browser console for import errors

---

### **Problem: Popover still cut off at bottom**

**Symptom:** Test 4 (Last Week) fails, popover extends below screen

**Solutions:**
1. Check if `position-area: top` was applied (inspect element)
2. Verify `position-try-fallbacks` in computed styles
3. Check console for CSS errors
4. Try manually adding in DevTools: `position-area: top !important;`

If manual CSS fix works → Polyfill not applying fallbacks correctly

---

### **Problem: Background still transparent on "today"**

**Symptom:** Test 2 fails, can't read popover content

**Solutions:**
1. Hard refresh (Ctrl+Shift+R)
2. Check computed `background-color` - should be `rgb(255, 255, 255)`
3. Check if higher specificity rule is overriding
4. Verify CSS file was saved correctly

---

### **Problem: Anchor positioning not working at all**

**Symptom:** Popovers positioned same as before (broken)

**Solutions:**
1. Check polyfill loaded (console message)
2. Verify `anchor-name: --calendar-day` on day cells (inspect)
3. Check if `position-anchor: --calendar-day` on popover (inspect)
4. Browser compatibility - try different browser

---

## 📝 NOTES SECTION

**Browser Information:**
- Browser: ________________
- Version: ________________
- OS: ________________

**Overall Assessment:**
________________

**Issues Found:**
________________

**Recommendations:**
________________

---

## 🚀 NEXT STEPS AFTER TESTING

**If ALL tests pass:**
1. ✅ Mark implementation as successful
2. ✅ Create final documentation
3. ✅ Consider removing old backup files (after 1 week)
4. ✅ Monitor user feedback

**If SOME tests fail:**
1. ⚠️ Document which tests failed
2. ⚠️ Analyze failure patterns
3. ⚠️ Adjust CSS fallback order
4. ⚠️ Re-test after adjustments

**If MOST tests fail:**
1. ❌ Consider rollback (see `ANCHOR_POSITIONING_BACKUP_BEFORE.md`)
2. ❌ Implement JavaScript fallback (previous plan)
3. ❌ Report issue to polyfill GitHub

---

**Tester Name:** ________________
**Test Date:** ________________
**Test Duration:** ________________
**Overall Result:** ⏳ PENDING / ✅ PASS / ❌ FAIL

**END OF TEST PROTOCOL**
