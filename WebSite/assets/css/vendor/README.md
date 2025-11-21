# Vendor CSS Libraries

This folder contains third-party CSS libraries used in the Loginet Invoice Management System.

## 📦 Included Libraries

### **Bootstrap 5.3+**
- **Location:** `vendor/bootstrap/`
- **Files:** `bootstrap.min.css`, `bootstrap.min.css.map`
- **Version:** 5.3+ (check package for exact version)
- **Purpose:** UI framework - grid system, components, utilities
- **License:** MIT License
- **Website:** https://getbootstrap.com/
- **CDN Alternative:** `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`

### **Tippy.js**
- **Location:** `vendor/tippy/`
- **Files:** `tippy.css`, `tippy-light-border.css`
- **Version:** 6.x (check package for exact version)
- **Purpose:** Tooltip library (positioned tooltips for calendar/invoices)
- **License:** MIT License
- **Website:** https://atomiks.github.io/tippyjs/
- **CDN Alternative:** `https://unpkg.com/tippy.js@6/dist/tippy.css`

## 🔄 Updating Libraries

### **Update Procedure:**

1. **Download new version** from official website or CDN
2. **Backup old version** to `.backups/` folder with date
3. **Replace files** in respective vendor folder
4. **Test thoroughly** - especially calendar, tooltips, forms
5. **Update version** in this README.md
6. **Commit changes** with clear message: "chore: update [library] to v[X.Y.Z]"

### **Update Checklist:**
- [ ] Downloaded from official source (not random CDN)
- [ ] Verified file integrity (hash if available)
- [ ] Backed up old version
- [ ] Updated Index.html if path changed
- [ ] Tested all major features
- [ ] Updated this README with new version

## ⚠️ Important Notes

### **DO NOT MODIFY** vendor files directly
- Vendor files should remain **unmodified** for easy updates
- To customize Bootstrap/Tippy, use **override styles** in:
  - `1-base/variables.css` (CSS custom properties)
  - `3-components/*.css` (component overrides)

### **Minified Files**
- Use `.min.css` files in production for performance
- Keep `.map` files for debugging (browser DevTools support)

### **Version Pinning**
- Current setup uses **local copies** (not CDN)
- Pros: No external dependency, works offline, faster load
- Cons: Manual updates required, no automatic security patches

## 📂 Folder Structure

```
vendor/
├── bootstrap/
│   ├── bootstrap.min.css       # Main Bootstrap CSS
│   └── bootstrap.min.css.map   # Source map for debugging
├── tippy/
│   ├── tippy.css               # Tippy.js core styles
│   └── tippy-light-border.css  # Tippy.js light theme
└── README.md                   # This file
```

## 🔗 External Dependencies

These libraries are loaded separately (not in vendor/css):

- **Bootstrap Icons:** `assets/bootstrap-icons/bootstrap-icons-1.11.3/`
- **FullCalendar:** `assets/js/index.global.min.js` (JavaScript library)
- **Popper.js:** `assets/js/popper.min.js` (required by Bootstrap & Tippy)

## 📝 License Compliance

All vendor libraries are **MIT Licensed**, which allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**Requirements:**
- Include original license notice (preserved in library files)
- Provide copy of license text (see individual library websites)

## 🆘 Troubleshooting

### **CSS Not Loading**
1. Check browser console for 404 errors
2. Verify paths in Index.html match folder structure
3. Hard refresh browser (Ctrl+Shift+R)
4. Check file permissions (should be readable)

### **Broken Styles After Update**
1. Restore backup version from `.backups/`
2. Check for breaking changes in library changelog
3. Review custom overrides for compatibility
4. Test in multiple browsers

### **Performance Issues**
1. Verify `.min.css` files are being used (not `.css`)
2. Enable HTTP compression (gzip/brotli)
3. Consider CDN for better caching
4. Check network tab for load times

## 📅 Update History

| Date | Library | Old Version | New Version | Notes |
|------|---------|-------------|-------------|-------|
| 2025-11-21 | Structure Created | - | - | Vendor folder organization |
| - | - | - | - | (Add updates here) |

---

**Maintained by:** Loginet Development Team
**Last Updated:** 2025-11-21
**Next Review:** Update when libraries have security patches or breaking changes
