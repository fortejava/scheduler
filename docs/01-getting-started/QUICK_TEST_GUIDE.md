# 🧪 QUICK TEST GUIDE - Single-Click Day Number + Double-Click TD Cell

**Quick reference for testing the new calendar navigation features**

---

## 🚀 **QUICK START**

1. **Refresh browser**: `Ctrl + F5` (hard refresh, clears cache)
2. **Open calendar view**: Click "Calendario" in navigation
3. **Navigate to current month**: Click "Oggi" if not already there

---

## ✅ **3 CRITICAL TESTS** (MUST PASS)

### **Test 1: Event Clicks** 🔴 **CRITICAL**
**Steps**:
1. Find any invoice event in the calendar (colored block)
2. Click it once

**Expected Result**:
- ✅ Modal opens with invoice details ("Dettaglio fattura")
- ✅ Shows invoice number, customer, amount, etc.
- ✅ NO navigation to day view

**If Fails**: 🚨 **REVERT IMMEDIATELY** - Event handler broken!

---

### **Test 2: Day Number Single-Click** 🟡 **IMPORTANT**
**Steps**:
1. Find a day number (e.g., "20" in the calendar)
2. Click the number **once**

**Expected Result**:
- ✅ Opens day view for that specific day
- ✅ View shows all-day events (no time slots)
- ✅ Immediate navigation (no delay)

**If Fails**: ⚠️ Investigate - check browser console for errors

---

### **Test 3: TD Double-Click** 🟢 **NEW FEATURE**
**Steps**:
1. Find a day cell with some empty space (between events or no events)
2. Double-click the empty space (NOT on event, NOT on day number)
3. Click twice quickly (within 300ms)

**Expected Result**:
- ✅ Opens day view for that day
- ✅ Same view as Test 2 (all-day events)

**If Fails**: ⚠️ Might need timing adjustment or target detection fix

---

## 🎯 **ADDITIONAL TESTS** (If time permits)

### **Test 4: Hover Effects**
- Hover over day number → Light blue background + bold text ✓
- Move mouse away → Background disappears ✓

### **Test 5: Today's Day (19)**
- Click day 19 → Opens day view ✓
- Day number remains readable (not white on transparent) ✓

### **Test 6: Event Double-Click**
- Double-click an event → Opens invoice detail ✓
- Does NOT navigate to day view ✓

---

## 🔍 **WHAT TO LOOK FOR**

### **✅ GOOD SIGNS**
- No JavaScript errors in console (F12 → Console tab)
- Fast, responsive clicks
- Smooth transitions
- All existing functionality still works

### **🚨 BAD SIGNS**
- JavaScript errors in console
- Event clicks don't open invoice detail ← **CRITICAL**
- Multiple day views opening
- Clicks not registering

---

## ⏪ **QUICK REVERT** (If needed)

**Copy/paste in terminal**:

**Linux/Mac**:
```bash
cp WebSite/assets/js/calendar.js.backup_before_single_double_click_20251119_164240 WebSite/assets/js/calendar.js
```

**Windows**:
```cmd
copy WebSite\assets\js\calendar.js.backup_before_single_double_click_20251119_164240 WebSite\assets\js\calendar.js
```

Then refresh browser (Ctrl+F5)

---

## 📊 **REPORT RESULTS**

After testing, report:
- ✅ Which tests passed
- ❌ Which tests failed (with details)
- 🐛 Any unexpected behavior
- 📋 Browser console errors (if any)

---

**Good luck with testing!** 🚀
