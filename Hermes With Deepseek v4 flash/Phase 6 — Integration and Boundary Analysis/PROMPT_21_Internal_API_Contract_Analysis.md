# Prompt 21: Complete Internal API Contract Analysis

> **Phase:** 6 — Integration & Boundary Analysis  
> **Dependencies:** PROMPT_11 (Data Flow), PROMPT_12 (Execution Paths), All Phase 5 outputs (if AI system)  
> **Input Required:** Data flows, execution paths, component decomposition  
> **Output Produced:** Complete internal API contract documentation with schemas, versioning, and interface specifications  
> **Estimated Effort:** 25–50 minutes

---

## 1. MISSION

You are the API Contract Analyst. Your mission is to document every internal API in the system — the contracts between components, services, and modules. These internal interfaces define the system's modularity and are critical for understanding how components interact.

---

## 2. PREREQUISITES

- [ ] PROMPT_11 completed — data flow maps
- [ ] PROMPT_12 completed — execution path maps
- [ ] PROMPT_08 completed — component decomposition (interfaces)

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Identify Every Internal Interface**

Find every point where one component calls another:

- Service-to-service calls (function calls, method invocations)
- Module-to-module imports (public API access)
- Event emissions and subscriptions
- Shared data structure boundaries
- Configuration injection points
- Plugin/extension interfaces

**Step 2: Document Each API Contract**

```
## Contract: UserService.createUser

### Provider
Component: UserService
File: `src/services/user.service.ts`
Method: `async createUser(data: CreateUserDto): Promise<UserResponse>`

### Consumer(s)
Component: UserController
File: `src/api/controllers/user.controller.ts:45`
Call: `await userService.createUser(req.body)`

### Contract
Input: CreateUserDto — { name: string, email: Email, password: string }
Output: UserResponse — { id: UUID, name: string, email: Email, createdAt: Date }
Errors: ValidationError, DuplicateEmailError, DatabaseError

### Usage Pattern
- Call frequency: Per user registration request
- Transactional: Yes (wraps in database transaction)
- Async: Yes

### Versioning
- Contract version: Implicit (same as code version)
- Backward compatibility: Input fields are additive only
```

**Step 3: Map API Dependency Chains**

```
UserController → UserService → UserRepository → Database
                             → EmailService → External SMTP
```

**Step 4: Identify Implicit Contracts**

Not all contracts are explicit functions. Also document:

- **Data format contracts** — JSON shapes, serialization formats
- **Error contract** — what errors each component can throw
- **Timing contract** — expected response times, timeout expectations
- **Resource contract** — memory, connections, file handles consumed
- **Side effect contract** — what state changes are guaranteed vs. incidental
- **Thread safety contract** — reentrancy, concurrent access guarantees

---

## 5. OUTPUT SPECIFICATION

Generate `21_api_contracts.md`:

### 5.1 Internal API Overview

[Summary of internal API surface]

### 5.2 Service Contract Catalog

| Service | Method | Input | Output | Errors | Consumer |
|---------|--------|-------|--------|--------|----------|
| UserService | createUser | CreateUserDto | UserResponse | Validation, Duplicate, DB | UserController |

### 5.3 Detailed Contracts

[Full contract documentation per interface — Step 2]

### 5.4 API Dependency Chains

[Dependency chain diagrams for major flows]

### 5.5 Implicit Contracts

[Data format, error, timing, resource, side effect contracts]

---

## 6. QUALITY GATE

- [ ] All internal APIs identified
- [ ] Each API has documented contract (input, output, errors)
- [ ] API dependency chains mapped
- [ ] Implicit contracts documented
- [ ] Service boundaries verified against component decomposition

---

## 7. HANDOFF

Pass to PROMPT_22 (External Service Integration) and PROMPT_23 (Event Stream):
- Service contracts that call external services (those external calls need documentation)
- Event emissions that cross component boundaries (event flow documentation)
