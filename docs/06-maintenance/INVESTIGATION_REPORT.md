# CALENDAR INVESTIGATION REPORT
**Date**: 2025-11-19
**FullCalendar Version**: v6.1.19 (Standard Bundle)

---

## ISSUE 1: DOUBLE-CLICK DAY NAVIGATION NOT WORKING ❌

### Root Cause Identified
**Location**: `WebSite/assets/js/calendar.js:428`

**Current Code**:
```javascript
this.instance.changeView('timeGridDay', dateStr);
```

**BUG**: Using **WRONG VIEW NAME**!

### FullCalendar v6 View Names
- `dayGridDay` = Day view with **all-day events** (NO time slots) ✅ **CORRECT**
- `timeGridDay` = Day view with **time slots** ❌ **WRONG**

### Why It's Not Working
The code attempts to switch to `timeGridDay`, but:
1. The calendar is configured for all-day events (no time slots)
2. User explicitly wants `dayGridDay` to match "Giorno" button behavior
3. FullCalendar v6 might be silently failing or not rendering the view properly

### Solution
**Change line 428** from:
```javascript
this.instance.changeView('timeGridDay', dateStr);
```

**To**:
```javascript
this.instance.changeView('dayGridDay', dateStr);
```

---

## ISSUE 2: TODAY'S DAY READABILITY (WHITE TEXT ON NO BACKGROUND) 👁️

### Root Cause Analysis
**Location**: `WebSite/assets/js/calendar.js:404-407`

**Current Code**:
```javascript
dayNumber.addEventListener('mouseleave', () => {
    dayNumber.style.background = 'transparent';  // ← PROBLEM!
    dayNumber.style.fontWeight = 'normal';
});
```

### The Problem
1. User hovers over day 19 (today)
2. Our code applies hover background: `rgba(0, 44, 61, 0.1)` ✅
3. User moves mouse away
4. Our code sets `background: transparent` ❌
5. **BUT**: FullCalendar already styled today's day number with a contrast color (likely white or light)
6. Result: **White text on transparent background** = unreadable!

### DOM Evidence (from user)
```html
<a class="fc-daygrid-day-number"
   style="background: transparent; font-weight: normal;">19</a>
```

### FullCalendar's Today Styling
FullCalendar v6 adds special styling to today's day via CSS class `fc-day-today` and likely:
- Applies background color to the cell (not the day number)
- OR applies contrast text color to day number
- Our inline `background: transparent` overrides FullCalendar's styling

### Solution Options

**Option A: Don't Set Transparent on Today's Day**
Check if element is today's day before removing background:
```javascript
dayNumber.addEventListener('mouseleave', () => {
    const dayCell = dayNumber.closest('.fc-daygrid-day');
    if (!dayCell.classList.contains('fc-day-today')) {
        dayNumber.style.background = 'transparent';
    } else {
        dayNumber.style.background = '';  // Remove inline style, let CSS take over
    }
    dayNumber.style.fontWeight = 'normal';
});
```

**Option B: Use Empty String Instead of Transparent**
Remove inline style entirely and let FullCalendar's CSS handle it:
```javascript
dayNumber.addEventListener('mouseleave', () => {
    dayNumber.style.background = '';  // Remove inline style
    dayNumber.style.fontWeight = '';   // Remove inline style
});
```

**Recommendation**: **Option B** - Simpler and lets FullCalendar's native CSS handle all styling.

---

## ISSUE 3: SQL TEST DATA - WRONG SCHEMA ❌

### Actual Database Schema (from DB.sql)

**Invoices Table** (lines 82-94):
```sql
CREATE TABLE [dbo].[Invoices](
    [InvoiceID] [int] IDENTITY(1,1) NOT NULL,
    [InvoiceNumber] [nvarchar](50) NOT NULL,
    [CustomerID] [int] NOT NULL,
    [InvoiceDate] [datetime] NOT NULL,
    [DueDate] [datetime] NOT NULL,              ← NOT InvoiceDueDate!
    [TotalAmount] [decimal](18, 2) NOT NULL,    ← NOT InvoiceDue!
    [InvoiceTax] [decimal](18, 2) NULL,
    [StatusID] [int] NOT NULL,                  ← NOT StatusCode!
    CONSTRAINT [PK_Invoices] PRIMARY KEY CLUSTERED ([InvoiceID] ASC),
    CONSTRAINT [UQ_InvoiceNumber] UNIQUE NONCLUSTERED ([InvoiceNumber] ASC)
)
```

**Status Table** (lines 54-60):
```sql
CREATE TABLE [dbo].[Status](
    [StatusID] [int] IDENTITY(1,1) NOT NULL,
    [StatusName] [nvarchar](50) NOT NULL,
    CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED ([StatusID] ASC),
    CONSTRAINT [UQ_StatusName] UNIQUE NONCLUSTERED ([StatusName] ASC)
)
```

**Customers Table** (lines 68-74):
```sql
CREATE TABLE [dbo].[Customers](
    [CustomerID] [int] IDENTITY(1,1) NOT NULL,
    [CustomerName] [nvarchar](100) NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY CLUSTERED ([CustomerID] ASC),
    CONSTRAINT [UQ_CustomerName] UNIQUE NONCLUSTERED ([CustomerName] ASC)
)
```

### What I Got Wrong
| What I Used | Actual Field Name | Table |
|-------------|-------------------|-------|
| `InvoiceDueDate` | `DueDate` | Invoices |
| `InvoiceDue` | `TotalAmount` | Invoices |
| `StatusCode` | `StatusID` | Invoices |

### SQL Script Requirements
1. **70 invoices** for tomorrow (2025-11-20)
2. **Distribution**:
   - 20 Overdue (StatusID = 3 or similar)
   - 30 Pending (StatusID = 2 or similar)
   - 20 Paid (StatusID = 1 or similar)
3. **Must be copy-paste executable**
4. **Separate .sql file**
5. **Include delete script** for cleanup

### Status Mapping (CONFIRMED from InvoicesService.cs)
**Database** (Status table):
- `StatusID 1` = `StatusLabel "Saldata"` (Paid)
- `StatusID 2` = `StatusLabel "Non Saldata"` (Unpaid)

**Application** (Computed StatusCode from `GetStatusCode()`):
- `StatusCode "0"` = PAID (StatusID 1, Green badge)
- `StatusCode "1"` = PENDING (StatusID 2 + DueDate > Now, Yellow badge)
- `StatusCode "2"` = OVERDUE (StatusID 2 + DueDate <= Now, Red badge)

**Logic** (InvoicesService.cs:558-571):
```csharp
if (StatusLabel == "Saldata")
    return "0";  // PAID
else
    return DueDate > DateTime.UtcNow ? "1" : "2";  // PENDING or OVERDUE
```

### SQL Test Data Strategy
**File Created**: `test_data_70_invoices.sql`

**Distribution for 2025-11-20**:
- **20 Paid**: StatusID = 1, DueDate = '2025-11-20 12:00:00' UTC
- **30 Pending**: StatusID = 2, DueDate = '2025-11-20 20:00:00' UTC (late evening, pending until 8 PM UTC)
- **20 Overdue**: StatusID = 2, DueDate = '2025-11-20 02:00:00' UTC (early morning, overdue after 2 AM UTC)

**Cleanup File Created**: `cleanup_test_data_70_invoices.sql`

**Test Customers**: `Test70Invoice_001` through `Test70Invoice_070`
**Test Invoices**: `TEST_70_001` through `TEST_70_070`

✅ **READY TO EXECUTE** - Both SQL files are copy-paste ready

---

## NEXT STEPS (PLANNED - NOT EXECUTED)

### 1. Fix Double-Click Navigation
**File**: `calendar.js`
**Line**: 428
**Change**: `'timeGridDay'` → `'dayGridDay'`

### 2. Fix Today's Day Readability
**File**: `calendar.js`
**Lines**: 404-407
**Change**: Set `background: ''` instead of `'transparent'`

### 3. Create SQL Test Data
**File**: New file `test_data_70_invoices.sql`
**Content**: INSERT and DELETE scripts with correct schema

### 4. Add Debug Logging (Temporary)
Add console.log to verify:
- Click events are firing
- changeView is being called
- View name being used

### 5. Remove Debug Code
After confirming fix works, remove all debug logging

---

## SUMMARY

| Issue | Root Cause | Solution | Priority |
|-------|-----------|----------|----------|
| Double-click not working | Wrong view name: `timeGridDay` | Use `dayGridDay` | HIGH |
| Today's day unreadable | Setting `background: transparent` | Use `background: ''` | HIGH |
| Need SQL test data | Wrong schema assumptions | Use correct field names | HIGH |

**All issues identified and solutions planned. Awaiting approval to implement.**
