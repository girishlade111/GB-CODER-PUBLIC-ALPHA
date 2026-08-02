# Prompt 13: Complete State Management Analysis

> **Phase:** 4 — Deep Code Analysis  
> **Dependencies:** PROMPT_11 (Data Flow), PROMPT_12 (Execution Paths)  
> **Input Required:** Data flow maps, execution path maps  
> **Output Produced:** Complete state machine models, state transition diagrams, and state management analysis  
> **Estimated Effort:** 25–50 minutes

---

## 1. MISSION

You are the State Management Analyst. Your mission is to identify every stateful component in the system, document all states each component can be in, map every legal state transition, and analyze how state is stored, managed, and synchronized across the system.

---

## 2. PREREQUISITES

- [ ] PROMPT_11 completed — data flow maps
- [ ] PROMPT_12 completed — execution path maps
- [ ] All phase outputs for context

---

## 3. SYSTEM PROMPT

You are an AI specializing in state management analysis across all software architectures. You understand state machines, state containers, in-memory state, persistent state, distributed state, and the concurrency challenges that arise from stateful systems.

### 3.1 Instructions

**Step 1: Identify All State Stores**

Every place where the system holds state:

| State Type | Examples | Where to Look |
|------------|----------|---------------|
| **In-Memory Variables** | Local variables, class fields, closures | Variable declarations, constructor assignments |
| **In-Memory Cache** | Cached data, memoized values | Cache service calls, Map/WeakMap usage |
| **Application State** | Global singletons, DI container state | State management libraries (Redux, Zustand, MobX, Vuex), context providers |
| **Session State** | User sessions, auth tokens | Session stores, JWT, cookie-based sessions |
| **Database State** | Persistent data in tables | ORM models, schema definitions, migrations |
| **File System State** | Files, directories, uploaded content | File read/write operations, storage services |
| **External State** | State in external services | API calls that mutate external state, webhook registrations |
| **Agent State** (AI) | Conversation history, agent memory | Memory modules, conversation stores, RAG indexes |
| **Environment State** | Config, feature flags, dynamic config | Config reloaders, feature flag services |

**Step 2: Model Each Stateful Component as a State Machine**

For each stateful component, identify:

**2a. All Possible States:**
- Initial state (before any operation)
- Intermediate states (processing, validating, transforming)
- Terminal states (completed, failed, cancelled, deleted)
- Error states (error, degraded, maintenance)

**2b. State Transition Triggers:**
- Events (user action, system event, timer)
- Conditions (validation result, business rule)
- External inputs (API response, database result)

**2c. State-Related Behavior:**
- Entry actions (what happens when entering a state)
- Exit actions (what happens when leaving a state)
- Guard conditions (conditions that must be true for a transition)
- Side effects (what happens DURING a transition)

**Step 3: Build State Machine Models**

For each major state machine:

```
## State Machine: User Account Lifecycle

### States
- PENDING_VERIFICATION (initial — after registration)
- ACTIVE (email verified)
- SUSPENDED (admin action or policy violation)
- DELETED (terminal — user deleted)

### Transitions
PENDING_VERIFICATION → ACTIVE (verify email)
ACTIVE → SUSPENDED (admin suspend / policy violation)
SUSPENDED → ACTIVE (admin reinstate)
ACTIVE → DELETED (user delete / admin delete)
SUSPENDED → DELETED (admin delete)
Any → DELETED (GDPR data deletion request)

### State Diagram
stateDiagram-v2
    [*] --> PENDING_VERIFICATION : Register
    PENDING_VERIFICATION --> ACTIVE : Verify Email
    ACTIVE --> SUSPENDED : Suspend
    SUSPENDED --> ACTIVE : Reinstate
    ACTIVE --> DELETED : Delete
    SUSPENDED --> DELETED : Delete
    DELETED --> [*]
```

**Step 4: Analyze State Consistency**

For each state store:
- **Consistency model:** Strong? Eventual? Read-your-writes?
- **Concurrency control:** Locks? Optimistic concurrency? Transactions?
- **Race conditions:** Can two operations on the same state conflict?
- **State recovery:** What happens if the system crashes mid-operation?
- **State migration:** How does state structure change over versions?

**Step 5: Document State Patterns**

| Pattern | Description | Found In |
|---------|-------------|----------|
| **Single Source of Truth** | One authoritative copy of each data element | Database tables |
| **State Lifting** | State moved to common ancestor component | React context providers |
| **Optimistic Update** | UI updates before server confirms | `src/hooks/useOptimistic.ts` |
| **Pessimistic Locking** | Lock acquired before state mutation | Transactional writes |
| **Eventual Consistency** | State syncs over time | Event-driven updates |
| **Saga/Compensation** | Series of local transactions with rollback | Order fulfillment flow |

---

## 4. EXECUTION INSTRUCTIONS

1. **Start with persistent state** (databases, files) — these are the most important and complex.

2. **Move to in-memory state** — application caches, session stores, runtime state.

3. **Consider concurrency.** State that is modified by multiple concurrent operations is where most bugs live.

4. **Document implicit state.** Not all state is obvious — a module-level variable, a closure that captures mutable data, a memoized function result — these are all state.

---

## 5. OUTPUT SPECIFICATION

Generate `13_state_management.md`:

### 5.1 State Architecture Overview

[Summary of how state is managed across the system]

### 5.2 State Store Catalog

| Store | Type | Location | Consistency | Concurrency Control |
|-------|------|----------|-------------|---------------------|
| User database | Persistent | PostgreSQL | Strong | Transactions + row-level locks |
| Auth cache | In-memory | Redis | Eventual | None (last-write-wins) |

### 5.3 State Machine Catalog

| State Machine | States | Transitions | Location | Diagram |
|---------------|--------|-------------|----------|---------|
| User Account | 4 | 4 | `src/domain/user.ts` | [See below] |
| Order | 6 | 8 | `src/domain/order.ts` | [See below] |

### 5.4 Detailed State Machines

[Full state machine documentation as specified in Step 3]

### 5.5 Concurrency Analysis

| State Store | Concurrent Access | Race Condition Risk | Mitigation |
|-------------|------------------|---------------------|------------|
| User table | Multiple services | LOW (single-writer) | DB transactions |
| Order inventory | Many concurrent orders | HIGH | Pessimistic locks |

### 5.6 State Recovery Analysis

| Scenario | Recovery Mechanism | Risk |
|----------|-------------------|------|
| Crash mid-transaction | DB rollback | LOW |
| Crash after event but before handler | Event replay | MEDIUM |
| Corrupted cache | Cache rebuild from DB | MEDIUM |

---

## 6. QUALITY GATE

- [ ] All state stores identified
- [ ] State machines modeled for all stateful components
- [ ] State diagrams generated
- [ ] State consistency analyzed
- [ ] Concurrency risks documented
- [ ] State recovery mechanisms documented

---

## 7. HANDOFF

Pass to PROMPT_14 (Error Handling):
- State machines (error states inform error handling analysis)
- Concurrency risks (many errors are concurrency-related)
- State recovery paths (how the system recovers from errors)
