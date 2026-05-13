---
name: Bug Report JWT TypeScript Error
about: Report TypeScript error TS2769 pada jwt.sign() - Server tidak bisa build/start
title: "Bug: TypeScript error TS2769 pada jwt.sign() - Server tidak bisa build/start"
labels: bug, high-priority, blocking
assignees: alfathhh
---

## 🐛 Deskripsi Bug

Server tidak bisa di-build (`npm run build`) atau di-start (`npm run dev`) karena TypeScript compilation error pada file `src/routes/auth.ts` baris 32.

---

## 📋 Error Message

```
src/routes/auth.ts:32:23 - error TS2769: No overload matches this call.
  Overload 1 of 5, gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'null'.
  Overload 2 of 5, gave the following error.
    Type 'string' is not assignable to type 'number | StringValue | undefined'.
  Overload 3 of 5, gave the following error.
    Object literal may only specify known properties, and 'expiresIn' does not exist in type 'SignCallback'.

32     const token = jwt.sign(
                         ~~~~

Found 1 error in src/routes/auth.ts:32
```

---

## 🔍 Root Cause

Package `@types/jsonwebtoken@^9.0.6` memperketat typing untuk property `expiresIn` di `SignOptions`. 

**Sebelumnya:** `expiresIn` bisa menerima plain `string`

**Sekarang:** `expiresIn` hanya terima `number | StringValue | undefined`
- `StringValue` adalah branded type dari package `ms`
- `process.env.JWT_EXPIRES_IN` mengembalikan `string | undefined`
- Type `string` tidak assignable ke `StringValue` — **MISMATCH!**

### ❌ Problematic Code

```typescript
// File: src/routes/auth.ts:32
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // ❌ string type issue
);
```

---

## ✅ Solusi

Cast options object sebagai `jwt.SignOptions`:

```typescript
// File: src/routes/auth.ts:32
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions  // ✅ Fixed!
);
```

Alternatif lainnya:
```typescript
import { SignOptions } from 'jsonwebtoken';

const signOptions: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET!,
  signOptions
);
```

---

## 🔧 Langkah Reproduksi

1. Clone repository:
   ```bash
   git clone https://github.com/alfathhh/tematik1306.git
   cd tematik1306
   ```

2. Install dependencies:
   ```bash
   cd padang-pariaman-map/server
   npm install
   ```

3. Try to build atau start server:
   ```bash
   npm run build    # ❌ Will fail with TS2769
   # atau
   npm run dev      # ❌ Will fail with TS2769
   ```

4. Error muncul

---

## 📊 Environment

| Komponen | Versi |
|----------|-------|
| Node.js | 20+ |
| TypeScript | ^5.4.5 |
| jsonwebtoken | ^9.0.2 |
| @types/jsonwebtoken | ^9.0.6 |
| ts-node | ^10.9.2 |
| OS | Windows/macOS/Linux |

---

## 🎯 Prioritas

**🔴 HIGH / CRITICAL** — Server tidak bisa start sama sekali, ini **BLOCKING** untuk semua development.

---

## 🔗 Related

- **PR #2:** [fix/jwt-sign-typescript-error](https://github.com/alfathhh/tematik1306/pull/2) — Sudah berisi fix
- **Issue #1:** Setup guide - Prisma schema path documentation

---

## ✔️ Testing Checklist

Setelah fix di-apply:

- [ ] `npm run build` berhasil tanpa error
- [ ] `npm run dev` berhasil dan server bisa start di port 3001
- [ ] Login endpoint `/api/auth/login` masih berfungsi normal
- [ ] JWT token di-generate dengan benar
- [ ] Token expired sesuai `JWT_EXPIRES_IN` env variable (default 7d)

---

## 📝 Notes

- Ini adalah breaking change dari TypeScript/JSONWebToken type definitions
- Tidak ada code logic yang berubah, hanya type casting
- Issue ini muncul sejak upgrade ke `@types/jsonwebtoken@^9.0.6`
