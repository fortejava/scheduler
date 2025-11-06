# Loginet CSS Architecture

## 📋 Overview

Modular CSS architecture following ITCSS (Inverted Triangle CSS) principles for the Loginet Invoice Management System.

---

## ⚠️ CRITICAL CLASSES - DO NOT REMOVE

The following classes are **REQUIRED** for application functionality. Removing them will break the entire UI.

### View Management (5-utilities/utilities.css)

| Class | Purpose | Used By |
|-------|---------|---------|
| `.view` | Hides all views by default | Index.html, ui.js |
| `.login-view` | Shows login view by default | Index.html |
| `.view-hidden` | Applied by JavaScript to hide views | ui.js (showView) |
| `.view-visible` | Applied by JavaScript to show views | ui.js (showView) |
| `.guest-hidden` | Hides menu items for unauthenticated users | Index.html, ui.js, auth.js |

**JavaScript Dependencies:**
- `assets/js/ui.js` - UI.showView(), UI.hideMenu(), UI.showMenu()
- `assets/js/auth.js` - Authentication state changes
- `Index.html` - View structure, menu items

**Warning:** These classes are dynamically manipulated by JavaScript. CSS-only changes may break app logic.

---

## 📁 Modular Structure

```
assets/css/
├── main.css                    # Master import file (USE THIS IN HTML)
├── bootstrap.min.css           # Bootstrap 5.3+ framework
│
├── 1-base/                     # Foundation layer
│   ├── variables.css           # CSS custom properties (colors, spacing, etc.)
│   ├── reset.css               # Minimal resets (works WITH Bootstrap)
│   └── typography.css          # Font families, sizes, styles
│
├── 2-layout/                   # Structural layer
│   ├── grid-extensions.css     # Bootstrap grid enhancements
│   ├── navbar.css              # Top navigation styling + icon colors
│   ├── sidebar.css             # Side navigation styling
│   └── page-layouts.css        # Common page structures
│
├── 3-components/               # UI components layer
│   ├── buttons.css             # Button variants + Bootstrap overrides
│   ├── forms.css               # Input fields, selects, validation
│   ├── cards.css               # Card components
│   ├── tables.css              # Table styling
│   ├── modals.css              # Modal dialogs
│   └── alerts.css              # Alert notifications
│
├── 4-views/                    # Page-specific layer
│   ├── dashboard.css           # Dashboard widgets
│   ├── invoices.css            # Invoice list, detail, creation
│   ├── customers.css           # Customer management
│   ├── calendar.css            # Calendar and scheduling
│   └── login.css               # Authentication pages
│
└── 5-utilities/                # Utilities layer (loaded last)
    ├── animations.css          # Transitions, keyframes + view animations
    ├── responsive.css          # Mobile, tablet, desktop utilities
    ├── utilities.css           # Display, spacing, text helpers + VIEW CLASSES
    └── print.css               # Print-optimized styles
```

---

## 🎨 Brand Colors

```css
/* Primary - Deep Ocean Blue */
--loginet-primary: #002C3D;
--loginet-primary-light: #004D66;
--loginet-primary-dark: #001A24;

/* Secondary - Vibrant Orange */
--loginet-secondary: #FF5912;
--loginet-secondary-light: #FF7740;
--loginet-secondary-dark: #E04D0F;

/* Accent - Complementary Blue */
--loginet-accent: #00A8CC;
--loginet-accent-light: #00C8F0;
```

**Usage in HTML:**
```html
<!-- Bootstrap classes automatically use Loginet colors -->
<button class="btn btn-primary">Deep Blue Button</button>
<button class="btn btn-secondary">Orange Button</button>

<!-- Custom Loginet variants also available -->
<button class="btn btn-loginet-primary">Custom Blue</button>
<button class="btn btn-loginet-secondary">Custom Orange</button>
```

**Icon Colors:**
All Bootstrap Icons (`.bi`) in navbar/nav-links automatically use Loginet orange (#FF5912).

---

## 📦 Import Order (main.css)

CSS modules are imported in dependency order:

1. **Base** (variables first - used by all other layers)
2. **Layout** (structural components)
3. **Components** (reusable UI elements)
4. **Views** (page-specific styles)
5. **Utilities** (overrides - loaded last for highest specificity)

**Why this matters:**
- Variables must load before anything that uses them
- Utilities load last so `!important` overrides work correctly
- Changing order can break styles

---

## 🔧 Bootstrap Integration

This CSS architecture **extends** Bootstrap, not replaces it.

### Bootstrap Overrides

**Buttons** (3-components/buttons.css):
- `.btn-primary` → Loginet Deep Blue (#002C3D)
- `.btn-secondary` → Loginet Orange (#FF5912)
- `.btn-outline-primary` → Blue outline
- `.btn-outline-secondary` → Orange outline

**Icons** (2-layout/navbar.css):
- `.navbar .bi` → Loginet Orange
- `.nav-link .bi` → Loginet Orange
- Hover states → Darker orange

**Why override?**
- Allows using standard Bootstrap classes in HTML
- No need to change existing markup
- Automatic brand consistency

---

## 🐛 Debugging CSS Issues

### Issue: Styles not applying

**Check:**
1. Browser DevTools → Network tab
2. Verify `main.css` loads (200 OK, not 404)
3. Click on `main.css` → Response tab
4. Verify all `@import` statements present
5. Check Console for CSS parse errors

### Issue: View switching not working

**Check:**
1. DevTools → Elements tab
2. Find `<div class="view login-view">`
3. Check Computed styles → "display"
4. Should show `display: block` from `.login-view`
5. Other `.view` elements should show `display: none`

**Test in Console:**
```javascript
// Test view switching
UI.showView('calendar-view');

// Check classes were applied
document.querySelector('#calendar-view').className;
// Should include: "view view-visible"

// Test menu visibility
UI.showMenu();
document.querySelectorAll('.guest-hidden').forEach(el => {
    console.log(el.id, el.classList.contains('guest-hidden'));
});
```

### Issue: Colors wrong

**Check:**
1. DevTools → Elements tab
2. Select button or icon element
3. Check Computed styles
4. Search for "color" or "background-color"
5. Verify source is from `buttons.css` or `navbar.css`, not Bootstrap

**If Bootstrap colors still showing:**
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check CSS load order (Bootstrap before main.css)

---

## 🚀 Adding New Styles

### Where to add new CSS?

| Type of Style | Location | Example |
|---------------|----------|---------|
| New color variable | `1-base/variables.css` | `--color-tertiary: #123456;` |
| Page layout change | `2-layout/page-layouts.css` | `.new-layout-class { ... }` |
| New button variant | `3-components/buttons.css` | `.btn-custom { ... }` |
| Form field styling | `3-components/forms.css` | `.custom-input { ... }` |
| Invoice page styling | `4-views/invoices.css` | `.invoice-special { ... }` |
| Utility class | `5-utilities/utilities.css` | `.text-orange { ... }` |
| Animation | `5-utilities/animations.css` | `@keyframes slide { ... }` |

### Best Practices

✅ **DO:**
- Add new variables to `variables.css` before using them
- Use CSS custom properties for colors/spacing
- Add comments explaining complex selectors
- Test in multiple browsers
- Use semantic class names

❌ **DON'T:**
- Use inline styles in HTML
- Add `!important` unless in utilities layer
- Override critical view management classes
- Change import order in main.css
- Remove warning comments

---

## 📱 Responsive Design

Breakpoints follow Bootstrap 5 standards:

```css
/* Mobile first approach */
.element { /* Base styles for mobile */ }

/* Tablet and up */
@media (min-width: 768px) { ... }

/* Desktop and up */
@media (min-width: 1024px) { ... }

/* Large desktop */
@media (min-width: 1200px) { ... }
```

Responsive utilities available in `5-utilities/responsive.css`.

---

## 🎯 Performance Optimization

### Current Setup
- **Uncompressed:** ~400KB
- **Minified:** ~150KB
- **Gzipped:** ~30KB

### Optimization Tips
1. CSS is cached after first load
2. All modules load together (no FOUC)
3. `@import` statements process server-side
4. Consider CSS minification for production
5. Use `preload` for critical CSS

**HTML Optimization:**
```html
<!-- Preload main CSS for faster parsing -->
<link rel="preload" href="assets/css/main.css" as="style">
<link rel="stylesheet" href="assets/css/main.css">
```

---

## 🔒 Critical Files Checklist

Before deploying, verify these files exist and are correct:

- [ ] `main.css` - Master import file
- [ ] `1-base/variables.css` - Brand colors defined
- [ ] `3-components/buttons.css` - Bootstrap overrides present
- [ ] `2-layout/navbar.css` - Icon color rules present
- [ ] `5-utilities/utilities.css` - View management classes present
- [ ] `5-utilities/animations.css` - View transitions present

---

## 📞 Support

**Issues?** Check:
1. This README for solutions
2. Inline comments in CSS files
3. Browser DevTools console/network tabs
4. Git history for recent changes

**For major CSS architecture changes:**
- Document in this README
- Update inline comments
- Test all views (Login, Calendar, Invoices, Customers)
- Test authentication flow (Login → Views → Logout)

---

## 📝 Changelog

### 2025-11-05 - Critical Fix
- ✅ Added missing view management classes to utilities.css
- ✅ Added view transition animations to animations.css
- ✅ Added Bootstrap button color overrides to buttons.css
- ✅ Added icon color overrides to navbar.css
- ✅ Created this README documentation

### 2025-11 - Initial Modular Architecture
- Created ITCSS-inspired modular structure
- Migrated from monolithic style.css
- Organized into 5 layers (base, layout, components, views, utilities)

---

**Last Updated:** November 5, 2025
**Version:** 2.1.0
**Maintained By:** Loginet Development Team
