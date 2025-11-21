# CSS OPTIMIZATION INVESTIGATION REPORT
**Date:** 2025-11-18
**Objective:** Systematically optimize table CSS with incremental testing

---

## PHASE 1: BASELINE DOCUMENTATION

### Current Table Styling - ELENCO FATTURE (Active Invoices)

**HTML Structure:**
```html
<table class="table table-hover table-striped deleted-invoice-table">
  <thead class="table-dark sticky-top">
    <tr>
      <th scope="col" style="font-size: 0.9rem; font-weight: 600;">#</th>
      <th scope="col" class="sortable" onclick="Invoices.sort('invoiceNumber')"
          style="font-size: 0.9rem; font-weight: 600;">
        <div class="sortable-content">
          N° FATTURA <i class="bi bi-arrow-down-up"></i>
        </div>
      </th>
      <!-- ... more headers ... -->
    </tr>
  </thead>
</table>
```

**CSS Classes Applied:**
1. `.table` (Bootstrap 5.3)
2. `.table-hover` (Bootstrap 5.3)
3. `.table-striped` (Bootstrap 5.3)
4. `.deleted-invoice-table` (custom - defined in deleted-invoices.css)
5. `.table-dark` on thead (Bootstrap 5.3 + custom overrides)
6. `.sticky-top` (Bootstrap 5.3)
7. `.sortable` (custom - defined in tables.css)

**Inline Styles (8 occurrences):**
- `style="font-size: 0.9rem; font-weight: 600;"` on every `<th>`

**CSS Files Affecting Tables:**
1. **Bootstrap 5.3** - base table styles
2. **tables.css** (3-components/)
   - Lines 11-46: `.table-loginet` (NOT USED)
   - Lines 53-60: Global `table thead` styling
   - Lines 69-94: `.table-dark` overrides
   - Lines 109-156: `.sortable` styling
3. **deleted-invoices.css** (4-views/)
   - Lines 110-150: `.deleted-invoice-table` (USED BY BOTH VIEWS - CONFUSING!)
4. **invoices.css** (4-views/)
   - Lines 29-67: `.invoice-table-loginet` (NOT USED)

---

### Current Table Styling - FATTURE ELIMINATE (Deleted Invoices)

**HTML Structure:**
```html
<table class="table table-hover table-striped deleted-invoice-table">
  <!-- Same as active invoices, but rows have red background via CSS -->
</table>
```

**Key Difference:**
- Red background on tbody rows: `background: #fef2f2;`
- Defined in `.deleted-invoice-table tbody tr` (deleted-invoices.css lines 133-141)

---

## COMPUTED VALUES (Browser DevTools)

### Table Header (th) - Computed Styles:
- **font-size:** 0.9rem (from inline style)
- **font-weight:** 600 (from inline style)
- **padding:** 16px (from Bootstrap `.table-dark` or global thead)
- **background-color:** #002C3D (from tables.css `.table-dark` overrides)
- **color:** white (from tables.css `.table-dark` overrides)
- **text-transform:** uppercase (from `.deleted-invoice-table thead th`)
- **letter-spacing:** 0.5px (from `.deleted-invoice-table thead th`)

### CSS Cascade Analysis:

**Font-size 0.9rem comes from:**
1. ✅ **Inline style** (highest specificity) - `style="font-size: 0.9rem;"`
2. ❌ CSS commented out in deleted-invoices.css line 126

**Font-weight 600 comes from:**
1. ✅ **Inline style** (highest specificity) - `style="font-weight: 600;"`
2. ❌ CSS commented out in deleted-invoices.css line 125

**Padding 16px comes from:**
1. ❌ CSS commented out in deleted-invoices.css line 124
2. ✅ **Fallback from Bootstrap or global thead** (needs verification)

---

## KEY FINDINGS

### Issue 1: Inline Styles Are Primary Source
- **Problem:** Inline styles provide font-size and font-weight
- **Risk:** Removing inline styles WITHOUT uncommenting CSS will break styling
- **Solution:** Must uncomment CSS in deleted-invoices.css BEFORE removing inline styles

### Issue 2: Class Naming Confusion
- **Problem:** `.deleted-invoice-table` used for BOTH active and deleted invoices
- **Impact:** Confusing for developers, hard to maintain
- **Solution:** Create new `.invoice-table` class for shared styling

### Issue 3: Commented CSS in deleted-invoices.css
```css
.deleted-invoice-table thead th {
/*  padding: var(--spacing-md, 16px);     <-- COMMENTED OUT
  font-weight: 600;                      <-- COMMENTED OUT
  font-size: 0.9rem;*/                   <-- COMMENTED OUT (was 14px, user changed to 0.9rem)
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
}
```
- **Critical:** These styles are disabled but inline styles compensate
- **Action Required:** Uncomment these lines BEFORE removing inline styles

### Issue 4: Two Unused CSS Classes (Dead Code)
1. `.table-loginet` (tables.css lines 11-46) - 36 lines unused
2. `.invoice-table-loginet` (invoices.css lines 29-67) - 39 lines unused
- **Total Dead Code:** 75 lines
- **Action:** Can be removed AFTER successful optimization

---

## TESTING REQUIREMENTS

### Visual Verification Checklist:
- [ ] Table header background: #002C3D (dark blue)
- [ ] Table header text: white
- [ ] Header font-size: 0.9rem (14.4px at 100% zoom)
- [ ] Header font-weight: 600 (semi-bold)
- [ ] Header text-transform: uppercase
- [ ] Header letter-spacing: 0.5px
- [ ] Active invoice rows: white background, gray on hover
- [ ] Deleted invoice rows: light red (#fef2f2), darker red on hover
- [ ] Sort icons: visible, properly aligned
- [ ] Sticky headers: remain at top when scrolling

### Functional Verification Checklist:
- [ ] Sorting works in both views
- [ ] Hover effects work on rows
- [ ] Checkbox selection works
- [ ] Responsive layout works on mobile
- [ ] No console errors
- [ ] No visual regressions

---

## NEXT STEPS

**PHASE 2:** Create new `.invoice-table` class (additive only, no changes to existing code)

**Risk Level:** 🟢 LOW (adding new code, not changing existing)

**Estimated Time:** 30 minutes
