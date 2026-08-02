# Prompt 28: Complete API Reference & Class Catalog Generation

> **Phase:** 7 — Documentation Generation  
> **Dependencies:** PROMPT_21 (Internal API Contracts)  
> **Input Required:** API contract analysis, component decomposition  
> **Output Produced:** Complete API reference documentation and catalog of all significant classes/interfaces  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the API Documentarian. Your mission is to generate a complete, navigable reference for every significant class, interface, function, and API endpoint in the system. This is the reference that developers consult daily.

---

## 2. PREREQUISITES

- [ ] PROMPT_21 completed — internal API contracts
- [ ] PROMPT_08 completed — component decomposition (classes)
- [ ] PROMPT_11 completed — data flow (function-level detail)

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

Generate `API_REFERENCE.md` and `CLASS_CATALOG.md`.

### 3.2 API Reference Structure

**REST API Endpoints:**
```
## POST /api/users

Creates a new user account.

### Request
Headers: Authorization: Bearer {token}
Body:
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email format)",
  "password": "string (required, 8-128 chars)"
}
```

### Response
Status: 201 Created
Body:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

### Errors
| Status | Error Code | Condition |
|--------|-----------|-----------|
| 400 | VALIDATION_ERROR | Invalid input format |
| 401 | UNAUTHORIZED | Missing/invalid auth token |
| 409 | DUPLICATE_EMAIL | Email already registered |

### Example
```bash
curl -X POST /api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secure123"}'
```

### Implementation
Controller: `src/api/controllers/user.controller.ts:30-55`
Service: `src/services/user.service.ts:40-120`
```

### 3.3 Class/Interface Catalog Structure

For every significant class/interface in the system:

```
## Class: UserService

### Location
File: `src/services/user.service.ts`

### Responsibility
Manages user lifecycle — registration, profile updates, account deletion

### Inheritance/Implements
- Extends: BaseService
- Implements: UserServiceInterface

### Constructor Dependencies
- `userRepository: UserRepository` (injected via DI)
- `emailService: EmailService` (injected via DI)
- `eventBus: EventBus` (injected via DI)

### Public Methods
| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| createUser | CreateUserDto | UserResponse | Register new user |
| getUserById | UUID | UserResponse | Get user by ID |
| updateUser | UUID, UpdateUserDto | UserResponse | Update user profile |
| deleteUser | UUID | void | Soft-delete user account |

### Key Private Methods
| Method | Purpose |
|--------|---------|
| hashPassword | Hash password with bcrypt |
| validateEmailUniqueness | Check email not in use |

### Error Contracts
| Method | Errors |
|--------|--------|
| createUser | ValidationError, DuplicateEmailError, DatabaseError |
| getUserById | NotFoundError |
| updateUser | NotFoundError, ValidationError |

### State
- None (stateless service — all state in repository)

### Thread Safety
- Safe (no mutable instance state)
```

---

## 5. OUTPUT SPECIFICATION

Generate two files:

**API_REFERENCE.md:**
- REST endpoints (if HTTP API)
- Internal service interfaces
- Event schemas
- Error code reference

**CLASS_CATALOG.md:**
- Every significant class
- Every interface (with implementations)
- Inheritance hierarchy
- Dependency injection wiring
- Factory/creation methods

---

## 6. QUALITY GATE

- [ ] Every REST/API endpoint documented with request/response/errors
- [ ] Every significant class documented
- [ ] Every interface documented with implementations
- [ ] Error codes cataloged
- [ ] Example requests included for APIs
- [ ] Constructor dependencies documented (for DI understanding)

---

## 7. HANDOFF

Pass to PROMPT_29 (Engineering Notes & Cross References):
- Class relationships for cross-referencing
- API endpoints for usage tracking
