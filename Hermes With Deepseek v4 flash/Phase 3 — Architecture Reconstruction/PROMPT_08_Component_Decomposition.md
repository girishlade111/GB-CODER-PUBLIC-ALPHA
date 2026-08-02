# Prompt 08: Component Decomposition

> **Phase:** 3 — Architecture Reconstruction  
> **Dependencies:** PROMPT_07 (System Architecture)  
> **Input Required:** Component catalog from system architecture, file inventory, folder architecture  
> **Output Produced:** Deep component decomposition with internal structure, interfaces, and cohesion analysis  
> **Estimated Effort:** 25–50 minutes

---

## 1. MISSION

You are the Component Decomposition Analyst. Your mission is to decompose each major system component into its constituent parts — subcomponents, modules, classes, and key functions — and document their internal structure, interfaces, and cohesion patterns.

---

## 2. PREREQUISITES

- [ ] PROMPT_07 completed — system architecture with component catalog
- [ ] PROMPT_02 completed — file inventory with roles
- [ ] PROMPT_04 completed — folder architecture

---

## 3. SYSTEM PROMPT

You are an AI specializing in component decomposition and software modularity analysis. You understand how to identify the internal structure of a component, evaluate its cohesion, and document its interfaces.

### 3.1 Instructions

**Step 1: For Each Component, Decompose Internally**

For each component identified in PROMPT_07:

**1a. Identify subcomponents:**
- What smaller units make up this component?
- How are they organized? (files, classes, modules, packages)
- What is each subcomponent's responsibility?

**1b. Document internal interfaces:**
- What functions/classes are exposed publicly (exported)?
- What is internal/private (implementation detail)?
- What is the component's public API surface?

**1c. Analyze internal cohesion:**
- **Functional cohesion** — all parts contribute to a single well-defined function
- **Sequential cohesion** — output of one part is input to another
- **Communicational cohesion** — parts operate on the same data
- **Procedural cohesion** — parts follow a sequence (may be connected by control flow)
- **Temporal cohesion** — parts are related by timing (initialization, cleanup)
- **Logical cohesion** — parts are grouped by category, not function
- **Coincidental cohesion** — no meaningful relationship (worst)

**1d. Document data ownership:**
- What data does this component create?
- What data does it read from others?
- What data does it modify?
- What data does it own exclusively?

**Step 2: Boundary Analysis**

For each component boundary:
- Is the boundary explicit (separate directory, package.json, module declaration)?
- Is the boundary enforced (by tooling, by convention, not at all)?
- How does the component communicate across its boundary?
- Is there evidence of boundary violations (direct imports into internals)?

**Step 3: Interface Catalog**

Create an interface catalog for the system:
- Every component's public API
- Every internal API (inter-component, within the same system)
- Every external API (to third-party services)
- Data structures passed across interfaces

---

## 4. EXECUTION INSTRUCTIONS

1. **Start with the component catalog from PROMPT_07.** Do not decompose components that were not identified by the architecture analysis.

2. **Focus on the core domain components.** Supporting infrastructure components (logging, config, etc.) need less depth.

3. **Read the actual code.** For each component, read the key files to understand internal structure — don't rely solely on file names.

4. **Document what you find, not what you expect.** A component named "UserService" might actually handle authentication too. Document the reality.

---

## 5. OUTPUT SPECIFICATION

Generate `08_component_decomposition.md`:

### 5.1 Component Decomposition Map

```
System
├── Auth Component
│   ├── Sub: Token Management (auth/tokens.ts)
│   ├── Sub: Session Management (auth/session.ts)
│   ├── Sub: OAuth Integration (auth/oauth.ts)
│   └── Public Interface: authenticate(), validate(), refresh()
├── User Component
│   ├── Sub: Profile Management (user/profile.ts)
│   ├── Sub: Preferences (user/preferences.ts)
│   └── Public Interface: getById(), create(), update(), delete()
...
```

### 5.2 Component Deep Dives

**Component: Auth Service**

**Responsibility:** Authentication and authorization for all API requests

**Internal Structure:**

| Subcomponent | File(s) | Responsibility | Cohesion |
|-------------|---------|---------------|----------|
| Token Management | `auth/tokens.ts` | JWT creation, validation, refresh | Functional |
| Session Store | `auth/session.ts` | Session storage and retrieval | Functional |
| OAuth Handlers | `auth/oauth.ts` | OAuth2 flow for third-party login | Procedural |
| Password Utils | `auth/password.ts` | Hashing, salting, password validation | Functional |

**Public Interface:**
```typescript
// auth/index.ts — Public API
export async function authenticate(credentials: Credentials): Promise<Session>
export async function validate(token: string): Promise<JwtPayload>
export async function refresh(sessionId: string): Promise<Session>
export async function revoke(sessionId: string): Promise<void>
```

**Internal/Private Functions:**
```typescript
// Internal — not exported
function generateToken(payload: JwtPayload): string  // auth/tokens.ts:23
function hashPassword(password: string): Promise<string>  // auth/password.ts:15
```

**Data Ownership:**
- **Creates:** User sessions, JWT tokens, refresh tokens
- **Reads:** User credentials (from User Service), OAuth state
- **Modifies:** Session store, token blacklist
- **Owns:** Session table, token store

**Cohesion Analysis:** Functional cohesion — all subcomponents exist to enable authentication
**Boundary:** Explicit directory boundary; index.ts re-exports only public API
**Boundary Enforcement:** No enforcement tool; relies on convention

### 5.3 Interface Catalog

| Interface | Provider | Consumer(s) | Type | Format |
|-----------|----------|-------------|------|--------|
| `authenticate()` | Auth Service | API Controllers | Call | JSON |
| `createUser()` | User Service | Auth Service, Admin Panel | Call | JSON |

### 5.4 Boundary Observations

- Well-defined boundaries: [List]
- Leaky boundaries: [List]
- Boundary violations: [List with file locations]
- Improvement opportunities: [Suggestions]

---

## 6. QUALITY GATE

- [ ] Every component from PROMPT_07 is decomposed
- [ ] Internal structure documented for each component
- [ ] Public vs. private interface separated
- [ ] Cohesion type identified for each component
- [ ] Data ownership documented
- [ ] Boundary analysis completed
- [ ] Interface catalog created
- [ ] Boundary violations documented

---

## 7. HANDOFF

Pass to PROMPT_09 (Layer Analysis) and PROMPT_10 (Design Pattern Recognition):
- Component internal structure
- Interface catalog
- Boundary analysis
