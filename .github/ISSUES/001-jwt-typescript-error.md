# Issue #1: Bug - TypeScript error TS2769 pada jwt.sign()

**Status:** 🔴 Open / High Priority  
**Created:** May 13, 2026  
**Labels:** bug, high-priority, blocking  
**Linked PR:** #2 (fix/jwt-sign-typescript-error)

---

## Summary

Server tidak bisa di-build atau di-start karena TypeScript compilation error pada `src/routes/auth.ts:32`. Ini adalah blocking issue yang mencegah development.

---

## Description

### ❌ Current Behavior

Ketika menjalankan `npm run build` atau `npm run dev` di folder `padang-pariaman-map/server`, proses gagal dengan error:

```
TSError: ⨯ Unable to compile TypeScript:
src/routes/auth.ts:32:23 - error TS2769: No overload matches this call.
  Overload 2 of 5, gave the following error.
    Type 'string' is not assignable to type 'number | StringValue | undefined'.
```

### 🔍 Root Cause

`@types/jsonwebtoken@^9.0.6` memperketat type definition untuk `SignOptions.expiresIn`:
- **Old:** accepts `string | number | undefined`
- **New:** accepts `number | StringValue | undefined` (where `StringValue` is a branded type)

Kode menggunakan `process.env.JWT_EXPIRES_IN || '7d'` yang mengembalikan generic `string`, tapi type checker sekarang butuh `StringValue` specifically.

### 📍 Affected File

**File:** `padang-pariaman-map/server/src/routes/auth.ts`  
**Line:** 32  
**Function:** POST `/api/auth/login`

```typescript
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // ❌ Line 32
);
```

---

## Solution

Cast options object as `jwt.SignOptions`:

```typescript
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions  // ✅ Fixed
);
```

---

## Impact

- **Severity:** 🔴 CRITICAL
- **Scope:** Server won't start — blocks all development
- **Users Affected:** All developers working on this project
- **Data Loss Risk:** None

---

## Acceptance Criteria

- [x] Server can start with `npm run dev` without TypeScript errors
- [x] Build command `npm run build` completes successfully
- [x] Login endpoint `/api/auth/login` works correctly
- [x] JWT token generation works as expected
- [x] Token expiration follows `JWT_EXPIRES_IN` env variable

---

## Environment

| Item | Value |
|------|-------|
| Node.js | 20+ |
| TypeScript | ^5.4.5 |
| jsonwebtoken | ^9.0.2 |
| @types/jsonwebtoken | ^9.0.6 |
| ts-node | ^10.9.2 |

---

## Timeline

- **Discovered:** May 12, 2026
- **PR Created:** May 12, 2026 — PR #2
- **Status:** Awaiting Review & Merge

---

## Related

- **PR #2:** [fix/jwt-sign-typescript-error](https://github.com/alfathhh/tematik1306/pull/2)
- **Dependencies:** 
  - jsonwebtoken: 9.0.2
  - @types/jsonwebtoken: 9.0.6

---

## Notes

- This is a type-level issue, not a runtime issue
- The fix is minimal and non-breaking
- No business logic changes required
- This is a known issue with newer TypeScript types for jsonwebtoken
