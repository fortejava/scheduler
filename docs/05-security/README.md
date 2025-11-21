# 🔒 Security Documentation

**Security guidelines and best practices**

---

## 📚 Security Documents

### [SECURITY_GUIDELINES_XSS.md](SECURITY_GUIDELINES_XSS.md) ⭐⭐⭐⭐⭐ Critical
Comprehensive XSS prevention guidelines
- **Defense-in-Depth Strategy** (3 layers)
- Input validation best practices
- Output encoding requirements
- SQL injection prevention (Entity Framework)
- BCrypt password hashing
- Token-based authentication
- Code examples and anti-patterns

**Key Topics:**
1. ✅ ASP.NET ValidateRequest (Layer 1)
2. ✅ Custom server-side validation (Layer 2)
3. ✅ Frontend HTML escaping (Layer 3)
4. ✅ Safe coding practices
5. ✅ Security checklist

---

## 🛡️ Security Features Implemented

- ✅ **BCrypt Password Hashing** - Industry standard (cost factor 12)
- ✅ **Token-based Sessions** - Secure session management
- ✅ **Role-based Access Control** - Admin, User, Visitor roles
- ✅ **XSS Prevention** - Multi-layer defense
- ✅ **SQL Injection Prevention** - Parameterized queries via EF
- ✅ **Request Validation** - ASP.NET built-in protection

---

**[⬅ Back to Documentation Index](../README.md)**
