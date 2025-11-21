# REVERT INSTRUCTIONS - Calendar Day View Fixes

**Date**: 2025-11-19
**Backup File**: `WebSite/assets/js/calendar.js.backup_before_dayview_fix_20251119`

---

## Changes Made

### Fix 1: Double-Click Day Navigation (Line 428)
**Changed**: `'timeGridDay'` → `'dayGridDay'`

**Reason**: Use all-day view instead of time-slot view to match "Giorno" button behavior

### Fix 2: Today's Day Readability (Lines 405-406)
**Changed**: `'transparent'` → `''` (empty string)

**Reason**: Remove inline styles instead of setting transparent to prevent white text on no background

---

## How to Revert (3 Options)

### Option A: Quick Revert (Copy Backup)
```bash
cp WebSite/assets/js/calendar.js.backup_before_dayview_fix_20251119 WebSite/assets/js/calendar.js
```

**Windows Command Prompt**:
```cmd
copy WebSite\assets\js\calendar.js.backup_before_dayview_fix_20251119 WebSite\assets\js\calendar.js
```

### Option B: Manual Revert (Undo Changes)

**Line 428** - Change back to:
```javascript
this.instance.changeView('timeGridDay', dateStr);
```

**Lines 405-406** - Change back to:
```javascript
dayNumber.style.background = 'transparent';
dayNumber.style.fontWeight = 'normal';
```

### Option C: Git Revert (if committed)
```bash
git checkout HEAD -- WebSite/assets/js/calendar.js
```

---

## Testing Checklist

1. ✅ Open calendar view in browser
2. ✅ Navigate to month view
3. ✅ Double-click on a day number (e.g., day 20)
   - **Expected**: Should open day view for that specific day
   - **View type**: Should be `dayGridDay` (all-day events, no time slots)
4. ✅ Hover over today's day number (day 19)
   - **Expected**: Light blue background appears
5. ✅ Move mouse away from today's day number
   - **Expected**: Background returns to normal (not transparent)
   - **Text should remain readable** (not white on transparent)
6. ✅ Click on today's day number
   - **Expected**: Background should still be readable after click

---

## SQL Test Data

Use these files to test with 70 invoices:
- **Insert**: `test_data_70_invoices.sql`
- **Delete**: `cleanup_test_data_70_invoices.sql`

---

## If Issues Found

1. **Revert immediately** using Option A (copy backup)
2. Report what went wrong:
   - Which issue occurred?
   - Browser console errors?
   - Unexpected behavior?
3. We'll analyze and propose alternative fix
