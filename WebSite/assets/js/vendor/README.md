# Third-Party JavaScript Libraries

This folder contains all third-party (vendor) JavaScript libraries used in the Loginet Invoice Management System.

**Purpose:** Separate vendor code from custom application code for easier maintenance and updates.

---

## ⚠️ IMPORTANT: Popper.js Loading Order

**Why we load Popper separately:**
- **Bootstrap bundle** includes Popper internally (for Bootstrap components)
- **Tippy.js** requires Popper to be **globally available**
- Bootstrap bundle does NOT expose Popper globally
- Solution: Load standalone Popper BEFORE Bootstrap bundle

**Load Order in Index.html:**
1. `popper/popper.min.js` - Creates global `Popper` object (for Tippy)
2. `bootstrap/bootstrap.bundle.min.js` - Uses internal Popper (for Bootstrap)
3. `tippy/tippy.umd.min.js` - Uses global Popper from #1

**Result:** Small redundancy (~20KB) but both libraries work correctly.

---

## 📦 Libraries Included

### **1. Popper.js 2.11.8**

**Files:**
- `popper/popper.min.js` (20KB) - Popper Core (UMD version)
- `popper/popper.min.js.map` (108KB) - Source map for debugging

**What it does:**
- Provides positioning engine for tooltips, popovers, dropdowns
- Used by Tippy.js for tooltip positioning
- Bootstrap bundle has its own internal copy

**License:** MIT
**Documentation:** https://popper.js.org/
**CDN:** https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js

**Update Procedure:**
1. Download latest from https://unpkg.com/@popperjs/core@2/dist/umd/
2. Replace `popper.min.js` and `.map` file
3. Test Tippy tooltips and Bootstrap components
4. Verify version compatibility with Tippy and Bootstrap

**Used By:**
- Tippy.js (requires global Popper object)
- Bootstrap bundle (internal copy, not this file)

---

### **2. Bootstrap 5.3.x**

**Files:**
- `bootstrap/bootstrap.bundle.min.js` (79KB) - Bootstrap JavaScript + Popper.js
- `bootstrap/bootstrap.bundle.min.js.map` (325KB) - Source map for debugging

**What it does:**
- Provides interactive components (modals, dropdowns, tooltips, collapse, etc.)
- Includes Popper.js v2.x internally (no separate Popper needed!)

**License:** MIT
**Documentation:** https://getbootstrap.com/docs/5.3/
**CDN:** https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js

**Update Procedure:**
1. Download latest from https://getbootstrap.com/docs/5.3/getting-started/download/
2. Replace `bootstrap.bundle.min.js` and `.map` file
3. Test all components (modals, dropdowns, tooltips, forms)
4. Check for breaking changes in release notes

**Used For:**
- Modal dialogs (invoice/customer/user forms)
- Dropdown menus (navigation)
- Form validation
- Collapse/expand panels

---

### **2. Tippy.js 6.x**

**Files:**
- `tippy/tippy.umd.min.js` (24KB) - Tippy.js tooltip library
- `tippy/tippy.umd.min.js.map` (111KB) - Source map for debugging

**What it does:**
- Advanced tooltip library with rich features
- Provides customizable tooltips with HTML content, animations, etc.
- Used alongside Bootstrap tooltips for specific use cases

**License:** MIT
**Documentation:** https://atomiks.github.io/tippyjs/
**CDN:** https://unpkg.com/tippy.js@6/dist/tippy.umd.min.js

**Dependencies:**
- Requires Popper.js (provided by Bootstrap bundle)

**Update Procedure:**
1. Download latest from https://unpkg.com/tippy.js@6/dist/
2. Replace `tippy.umd.min.js` and `.map` file
3. Test tooltips throughout application
4. Check compatibility with current Popper version

**Used For:**
- Rich HTML tooltips
- Custom tooltip positioning
- Dynamic tooltip content
- Interactive tooltips

---

### **3. FullCalendar 6.x**

**Files:**
- `fullcalendar/index.global.min.js` (278KB) - FullCalendar library (all-in-one bundle)

**What it does:**
- Provides interactive calendar UI
- Supports multiple views (month, week, day, list)
- Event management (create, edit, delete)
- Drag-and-drop functionality

**License:** MIT
**Documentation:** https://fullcalendar.io/docs
**CDN:** https://cdn.jsdelivr.net/npm/fullcalendar@6/index.global.min.js

**Update Procedure:**
1. Download latest from https://fullcalendar.io/docs/initialize-globals
2. Replace `index.global.min.js`
3. Test calendar functionality:
   - View switching (month/week/day)
   - Event creation
   - Event editing
   - Event popover
   - Drag and drop
4. Check for API changes in release notes

**Used For:**
- Main calendar view
- Scheduling events/appointments
- Visual timeline
- Event popovers

---

## 🔄 General Update Guidelines

### **Before Updating:**
1. ✅ Check release notes for breaking changes
2. ✅ Backup current files to `.backups/`
3. ✅ Test in development environment first
4. ✅ Verify browser compatibility

### **Update Process:**
1. Download new version from official source (NOT random websites!)
2. Replace files in appropriate vendor folder
3. Hard refresh browser (Ctrl+Shift+R)
4. Test all functionality
5. Check browser console for errors
6. Update this README with new version number

### **After Updating:**
1. ✅ Test all features using the library
2. ✅ Check multiple browsers (Chrome, Firefox, Edge)
3. ✅ Verify mobile responsiveness
4. ✅ Update documentation if needed
5. ✅ Git commit with version change note

---

## 🐛 Troubleshooting

### **Library not loading (404 error):**
- Check file path in Index.html
- Verify file exists in correct vendor folder
- Hard refresh browser (Ctrl+Shift+R)

### **Source map warnings:**
- Download `.map` files from same source as `.js` files
- Place in same folder as `.js` file
- Or remove `//# sourceMappingURL=` comment from bottom of `.js` file

### **Library version conflicts:**
- Check Popper version compatibility (Tippy needs same Popper as Bootstrap bundle)
- Verify no duplicate libraries loaded
- Check for conflicting global variables

### **Functionality broken after update:**
- Check browser console for errors
- Review library's breaking changes documentation
- Rollback to previous version from `.backups/`
- Update custom code to match new API

---

## 📊 File Sizes (Current)

| Library | File | Size | Source Map | Total |
|---------|------|------|------------|-------|
| **Bootstrap** | bootstrap.bundle.min.js | 79KB | 325KB | 404KB |
| **Tippy** | tippy.umd.min.js | 24KB | 111KB | 135KB |
| **FullCalendar** | index.global.min.js | 278KB | - | 278KB |
| **TOTAL** | | **381KB** | **436KB** | **817KB** |

*Note: Source maps are only loaded when browser DevTools are open*

---

## 🔐 Security Notes

### **Only download from official sources:**
- ✅ Official website download links
- ✅ Official CDN (jsdelivr, unpkg, cdnjs)
- ✅ Official GitHub releases
- ❌ Random websites or untrusted sources

### **Verify integrity:**
- Check file sizes match expected values
- Review code briefly (shouldn't look obfuscated beyond minification)
- Use Subresource Integrity (SRI) hashes when using CDN (optional)

### **Keep updated:**
- Monitor security advisories for each library
- Update when security fixes are released
- Subscribe to library release notifications

---

## 📝 Version History

| Date | Library | Version | Notes |
|------|---------|---------|-------|
| 2025-11-21 | Bootstrap | 5.3.2 | Switched to bundle version (includes Popper) |
| 2025-11-21 | Tippy | 6.3.7 | Added source map |
| 2025-11-21 | FullCalendar | 6.x | No changes |

---

## 🆘 Support

**Library Issues:**
- Check official documentation first
- Search GitHub issues
- Stack Overflow for common problems

**Integration Issues:**
- Review `WebSite/assets/js/core/` and `modules/` for usage
- Check `tooltip-manager.js` for Tippy integration
- Check `calendar.js` for FullCalendar integration

---

**Maintained by:** Loginet Development Team
**Last Updated:** 2025-11-21
**Folder Created:** 2025-11-21 (JavaScript Restructuring Phase 1)
