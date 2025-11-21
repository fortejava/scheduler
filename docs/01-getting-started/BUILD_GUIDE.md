# 🔧 CSS Build System Guide

## Overview

This project uses **PostCSS** for processing and optimizing CSS files for production.

**Benefits:**
- ✅ Automatic vendor prefixing (cross-browser compatibility)
- ✅ CSS minification (smaller file sizes)
- ✅ Modern CSS features with fallbacks
- ✅ Source maps for debugging
- ✅ Import resolution (@import statements)

---

## 📋 Prerequisites

### **1. Install Node.js**

**Check if already installed:**
```bash
node --version
npm --version
```

**If not installed:**
- Download from: https://nodejs.org/
- Install **LTS version** (16.x or higher)
- Restart terminal after installation

### **2. Verify Installation**
```bash
cd C:\Users\Drako\Desktop\Z-Experiment-Scheduler\scheduler
node --version  # Should show v16.x or higher
npm --version   # Should show 8.x or higher
```

---

## 🚀 Quick Start

### **One-Time Setup**

1. **Install dependencies:**
   ```bash
   npm install
   ```

   This installs PostCSS and all plugins (~15MB, takes 30-60 seconds).

2. **Create dist folder:**
   ```bash
   npm run clean
   mkdir -p WebSite/assets/css/dist/vendor
   ```

### **Build CSS**

**Development build** (with source maps):
```bash
npm run css:build
```

**Production build** (minified):
```bash
npm run css:prod
```

**Watch mode** (auto-rebuild on file changes):
```bash
npm run css:watch
```

---

## 📂 Output Structure

After build:
```
WebSite/assets/css/
├── dist/                          # BUILD OUTPUT (generated)
│   ├── main.min.css               # Minified Loginet CSS (~50KB)
│   ├── main.min.css.map           # Source map (debugging)
│   └── vendor/
│       ├── bootstrap.min.css      # Minified Bootstrap
│       └── tippy.min.css          # Minified Tippy
│
├── vendor/                        # SOURCE FILES
├── 1-base/                        # SOURCE FILES
├── 2-layout/                      # SOURCE FILES
└── ... (other source folders)
```

---

## 🔄 Integration with Index.html

### **Option A: Use Build Output (Production)**

**Benefits:** Faster load, smaller size, optimized

**Index.html changes:**
```html
<!-- BEFORE (Development) -->
<link href="assets/css/vendor/bootstrap/bootstrap.min.css" rel="stylesheet" />
<link href="assets/css/main.css" rel="stylesheet" />

<!-- AFTER (Production) -->
<link href="assets/css/dist/vendor/bootstrap.min.css" rel="stylesheet" />
<link href="assets/css/dist/main.min.css" rel="stylesheet" />
```

### **Option B: Keep Current Setup (Development)**

**Benefits:** Easier debugging, no build step needed

**Current setup works fine for development:**
```html
<link href="assets/css/vendor/bootstrap/bootstrap.min.css" rel="stylesheet" />
<link href="assets/css/main.css" rel="stylesheet" />
```

**Recommendation:** Use **Option B** during development, switch to **Option A** for production deployment.

---

## 📜 Available Scripts

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm install` | Install dependencies | First time setup, after pulling from Git |
| `npm run css:build` | Build CSS (development) | After CSS changes, testing |
| `npm run css:prod` | Build CSS (production) | Before deployment |
| `npm run css:watch` | Auto-rebuild on changes | Active development |
| `npm run vendor:build` | Process vendor CSS | After updating Bootstrap/Tippy |
| `npm run build` | Build everything | Full rebuild |
| `npm run clean` | Delete dist folder | Clean slate, troubleshooting |

---

## 🎯 Development Workflow

### **Typical Workflow:**

1. **Make CSS changes** in source files (`1-base/`, `2-layout/`, etc.)
2. **Test locally** with current setup (no build needed)
3. **Before Git commit:**
   ```bash
   npm run css:build
   git add .
   git commit -m "style: update calendar styles"
   ```
4. **Before production deployment:**
   ```bash
   npm run css:prod
   # Update Index.html to use dist/ files
   # Deploy
   ```

### **Watch Mode (Recommended for Active Development):**

```bash
# Terminal 1: Watch CSS
npm run css:watch

# Terminal 2: Your development server
# (CSS rebuilds automatically on file save)
```

---

## ⚙️ Configuration

### **PostCSS Config** (`postcss.config.js`)

Current plugins:
- **postcss-import** - Resolve @import statements
- **postcss-preset-env** - Modern CSS features
- **autoprefixer** - Vendor prefixes (-webkit-, -moz-, etc.)
- **cssnano** - Minification (production only)

### **Browser Support** (`package.json` browserslist)

```
last 2 versions
> 1%
not dead
Chrome >= 90
Firefox >= 88
Safari >= 14
Edge >= 90
```

To change browser support, edit `browserslist` in `package.json`.

---

## 🐛 Troubleshooting

### **"npm: command not found"**
- Node.js not installed or not in PATH
- Solution: Install Node.js, restart terminal

### **"Cannot find module 'postcss'"**
- Dependencies not installed
- Solution: Run `npm install`

### **Build fails with error**
- Check syntax errors in CSS files
- Run: `npm run clean` then `npm install`

### **Dist files not updating**
- Clear browser cache (Ctrl+Shift+R)
- Check if watching correct files
- Verify Index.html points to dist/ folder

### **Performance worse after build**
- Check if using `.min.css` files
- Verify gzip/brotli enabled on server
- Compare file sizes (should be smaller)

---

## 📊 Expected Results

### **File Size Comparison:**

| File | Before | After | Savings |
|------|--------|-------|---------|
| main.css | ~400KB | ~50KB | 87% |
| Bootstrap | 227KB | 160KB | 29% |
| Total CSS | ~630KB | ~210KB | 67% |

*Actual sizes may vary based on content*

### **Performance Impact:**

- **Load time:** ~200ms faster (on 3G connection)
- **Parse time:** ~50ms faster
- **Cache:** Better caching with versioned dist files

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Run `npm run css:prod`
- [ ] Update Index.html to use `dist/` files
- [ ] Test all pages (Calendar, Invoices, Customers, etc.)
- [ ] Verify browser console (no 404 errors)
- [ ] Test in multiple browsers (Chrome, Firefox, Edge)
- [ ] Enable gzip/brotli compression on server
- [ ] Add cache headers for CSS files (1 year)
- [ ] Consider adding hash to filename for cache busting

---

## 🔄 Updating Dependencies

**Check for updates:**
```bash
npm outdated
```

**Update all dependencies:**
```bash
npm update
```

**Update specific package:**
```bash
npm update postcss
```

**After updating:**
```bash
npm run build
# Test thoroughly
```

---

## 📝 Notes

### **Current Status:**
- ✅ Build system configured (2025-11-21)
- ✅ Package.json created
- ✅ PostCSS config ready
- ⏸️ **Optional:** Not required for development
- ⏸️ **Production:** Use before deployment for optimized CSS

### **Git Integration:**

**Add to `.gitignore`:**
```
node_modules/
WebSite/assets/css/dist/
*.log
package-lock.json
```

**Commit to Git:**
```
package.json
postcss.config.js
BUILD_GUIDE.md
```

### **MSBuild Integration (Optional):**

To auto-build CSS during MSBuild:
1. Add MSBuild task in Spider.sln
2. Run `npm run css:prod` before compilation
3. See MSBuild documentation for details

---

## 🆘 Support

**Issues with build process?**
- Check this guide first
- Review error messages carefully
- Test with clean install: `npm run clean && npm install`
- Check Node.js/npm versions match requirements

**CSS not loading?**
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for 404 errors
- Verify paths in Index.html
- Check network tab in DevTools

---

**Maintained by:** Loginet Development Team
**Last Updated:** 2025-11-21
**PostCSS Version:** 8.4.32
**Node.js Required:** >= 16.0.0
