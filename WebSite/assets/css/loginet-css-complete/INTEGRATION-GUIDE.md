# 🎯 LOGINET CSS - BOOTSTRAP INTEGRATION GUIDE

## 📚 Table of Contents
1. [Quick Start](#quick-start)
2. [File Structure](#file-structure)
3. [Bootstrap Integration](#bootstrap-integration)
4. [Color System](#color-system)
5. [Component Examples](#component-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Step 1: Copy CSS Files
```bash
# Copy the entire loginet-css folder to your project
cp -r loginet-css/ /path/to/your/project/assets/css/
```

### Step 2: Update HTML
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loginet Invoice Management</title>
    
    <!-- Bootstrap CSS (FIRST) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Loginet Custom CSS (AFTER Bootstrap) -->
    <link href="assets/css/main.css" rel="stylesheet">
</head>
<body>
    <!-- Your content here -->
    
    <!-- Bootstrap JS (Before closing body) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### Step 3: Test
Open your HTML file and verify:
- ✅ Loginet colors appear (#002C3D, #FF5912)
- ✅ Bootstrap grid works
- ✅ Custom components render correctly

---

## 📁 File Structure

```
loginet-css/
├── main.css                 # Master import file (USE THIS)
├── 1-base/
│   ├── variables.css        # Design tokens (colors, spacing, etc.)
│   ├── reset.css            # Browser normalization
│   └── typography.css       # Text styles
├── 2-layout/
│   ├── grid-extensions.css  # Custom grid utilities
│   ├── navbar.css           # Top navigation
│   ├── sidebar.css          # Left sidebar
│   └── page-layouts.css     # Page templates
└── 3-components/
    ├── buttons.css          # Button variants
    ├── forms.css            # Form controls
    ├── cards.css            # Card components
    ├── tables.css           # Data tables
    ├── modals.css           # Modal dialogs
    └── alerts.css           # Notifications
```

**Total Size**: ~35KB (unminified), ~12KB (minified + gzipped)

---

## 🎨 Color System

### Brand Colors
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
```

### Usage in HTML
```html
<!-- Use Bootstrap classes AS IS -->
<button class="btn btn-primary">Bootstrap Primary</button>

<!-- Use Loginet custom classes for brand colors -->
<button class="btn btn-loginet-primary">Loginet Primary (#002C3D)</button>
<button class="btn btn-loginet-secondary">Loginet Orange (#FF5912)</button>

<!-- Text colors -->
<p class="text-brand-primary">Deep Ocean Blue text</p>
<p class="text-brand-secondary">Vibrant Orange text</p>
```

---

## 🧱 Bootstrap Integration Strategy

### ✅ DO: Extend Bootstrap
```html
<!-- Use Bootstrap base + Loginet custom -->
<button class="btn btn-loginet-primary">
    <i class="bi bi-plus"></i> Add Invoice
</button>

<!-- Bootstrap grid + Loginet utilities -->
<div class="container">
    <div class="row gap-lg">
        <div class="col-md-6">Content</div>
        <div class="col-md-6">Content</div>
    </div>
</div>
```

### ❌ DON'T: Override Bootstrap Core
```html
<!-- WRONG - Overriding Bootstrap -->
<button class="btn">This breaks Bootstrap styling</button>

<!-- RIGHT - Use Bootstrap as base -->
<button class="btn btn-primary">Uses Bootstrap</button>
<button class="btn btn-loginet-primary">Uses Loginet custom</button>
```

### Component Naming Convention
```
Bootstrap:  .btn, .card, .modal
Loginet:    .btn-loginet-primary, .card-loginet, .modal-loginet

RULE: Loginet classes always have "-loginet" suffix to avoid conflicts
```

---

## 🎯 Component Examples

### 1. Dashboard Page
```html
<div class="main-content">
    <!-- Page Header -->
    <div class="page-header">
        <div class="page-header-top">
            <h1 class="page-header-title">Dashboard</h1>
            <div class="page-header-actions">
                <button class="btn btn-loginet-secondary">
                    <i class="bi bi-plus"></i> New Invoice
                </button>
            </div>
        </div>
    </div>
    
    <!-- Stats Cards (Bootstrap Grid) -->
    <div class="row dashboard-stats g-4">
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-card-icon">
                    <i class="bi bi-file-earmark-text"></i>
                </div>
                <div class="stat-card-value">248</div>
                <div class="stat-card-label">Total Invoices</div>
                <div class="stat-card-change positive">
                    <i class="bi bi-arrow-up"></i> 12% from last month
                </div>
            </div>
        </div>
        <!-- Repeat for other stats -->
    </div>
</div>
```

### 2. Form Page
```html
<div class="form-page">
    <div class="form-container">
        <div class="form-header">
            <h2 class="form-title">Create New Invoice</h2>
            <p class="form-subtitle">Fill in the details below</p>
        </div>
        
        <div class="form-body">
            <!-- Use Bootstrap form controls -->
            <div class="mb-3">
                <label class="form-label-loginet required">Customer Name</label>
                <input type="text" class="form-control form-control-loginet" placeholder="Enter customer name">
            </div>
            
            <div class="mb-3">
                <label class="form-label-loginet required">Amount</label>
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control form-control-loginet" placeholder="0.00">
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label-loginet">Status</label>
                <select class="form-select form-select-loginet">
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                </select>
            </div>
        </div>
        
        <div class="form-footer">
            <button class="btn btn-outline-secondary">Cancel</button>
            <button class="btn btn-loginet-secondary">Create Invoice</button>
        </div>
    </div>
</div>
```

### 3. Data Table
```html
<div class="table-responsive-loginet">
    <table class="table table-loginet table-striped">
        <thead>
            <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>#INV-001</strong></td>
                <td>Acme Corporation</td>
                <td>$5,400.00</td>
                <td><span class="table-status paid">Paid</span></td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn"><i class="bi bi-eye"></i></button>
                        <button class="table-action-btn"><i class="bi bi-pencil"></i></button>
                        <button class="table-action-btn"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

### 4. Modal Dialog
```html
<!-- Backdrop -->
<div class="modal-backdrop-loginet show"></div>

<!-- Modal -->
<div class="modal-loginet show">
    <div class="modal-dialog-loginet">
        <div class="modal-header-loginet">
            <h3 class="modal-title-loginet">Delete Invoice</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body-loginet">
            <div class="modal-confirm">
                <div class="modal-confirm-icon danger">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
            </div>
        </div>
        <div class="modal-footer-loginet">
            <button class="btn btn-outline-secondary">Cancel</button>
            <button class="btn btn-danger">Delete</button>
        </div>
    </div>
</div>
```

---

## 💡 Best Practices

### 1. Use Bootstrap Grid System
```html
<!-- ✅ GOOD - Use Bootstrap grid -->
<div class="container">
    <div class="row g-4">
        <div class="col-md-6">Column 1</div>
        <div class="col-md-6">Column 2</div>
    </div>
</div>

<!-- ❌ BAD - Don't recreate grid -->
<div class="custom-grid">
    <div class="custom-column">Column 1</div>
</div>
```

### 2. Use Bootstrap Spacing Utilities
```html
<!-- ✅ GOOD - Use Bootstrap spacing (m-*, p-*, g-*) -->
<div class="mb-4 p-3">Content</div>

<!-- ❌ BAD - Don't create custom spacing -->
<div class="custom-margin-bottom">Content</div>
```

### 3. Combine Bootstrap + Loginet Classes
```html
<!-- ✅ PERFECT - Best of both worlds -->
<button class="btn btn-lg btn-loginet-secondary">
    Large Loginet Button
</button>

<div class="card card-loginet mb-4">
    <div class="card-body">Content</div>
</div>
```

### 4. Use CSS Variables for Theming
```css
/* Easy theme customization */
:root {
    --loginet-primary: #002C3D;  /* Change once, updates everywhere */
    --loginet-secondary: #FF5912;
}
```

---

## 🔧 Troubleshooting

### Issue 1: Colors Not Showing
**Problem**: Loginet colors (#002C3D, #FF5912) not appearing

**Solution**:
```html
<!-- Check import order -->
<link href="bootstrap.min.css" rel="stylesheet">
<link href="assets/css/main.css" rel="stylesheet"> <!-- MUST be after Bootstrap -->
```

### Issue 2: Styles Conflicting
**Problem**: Bootstrap and Loginet styles conflicting

**Solution**: Use Loginet custom classes instead of overriding Bootstrap
```html
<!-- ❌ Wrong -->
<button class="btn">Button</button>

<!-- ✅ Right -->
<button class="btn btn-loginet-primary">Button</button>
```

### Issue 3: Sidebar Not Showing
**Problem**: Sidebar appears but doesn't work

**Solution**: Check JavaScript for collapse functionality
```javascript
// Add sidebar toggle functionality
document.querySelector('.sidebar-toggle').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
});
```

### Issue 4: Mobile Responsive Issues
**Problem**: Layout breaks on mobile

**Solution**: Ensure viewport meta tag is present
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 📱 Responsive Breakpoints

Loginet CSS uses Bootstrap's breakpoints:

```
xs: 0-575px     (Mobile)
sm: 576-767px   (Mobile landscape)
md: 768-991px   (Tablet)
lg: 992-1199px  (Desktop)
xl: 1200-1399px (Large desktop)
xxl: 1400px+    (Extra large)
```

---

## 🎨 Customization

### Change Colors
Edit `1-base/variables.css`:
```css
:root {
    /* Change brand colors here */
    --loginet-primary: #YOUR_COLOR;
    --loginet-secondary: #YOUR_COLOR;
}
```

### Add New Components
Create new file in `3-components/`:
```css
/* 3-components/your-component.css */
.your-component {
    /* Your styles */
}
```

Import in `main.css`:
```css
@import url('3-components/your-component.css');
```

---

## ✅ Checklist for Implementation

- [ ] Copy CSS files to project
- [ ] Import Bootstrap before Loginet CSS
- [ ] Test on all major browsers
- [ ] Verify colors (#002C3D, #FF5912)
- [ ] Check responsive behavior
- [ ] Test form validation
- [ ] Verify modal functionality
- [ ] Check sidebar collapse
- [ ] Test table responsiveness
- [ ] Validate accessibility

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review component examples
3. Check browser console for errors
4. Verify file paths are correct

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Compatible With**: Bootstrap 5.3+
