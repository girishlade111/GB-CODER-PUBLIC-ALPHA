# Prompt 07: System Architecture Reconstruction

> **Phase:** 3 — Architecture Reconstruction  
> **Dependencies:** PROMPT_04 (Folder Architecture), PROMPT_05 (Module Dependency), PROMPT_06 (Entry Points)  
> **Input Required:** Folder architecture, dependency graph, entry point catalog  
> **Output Produced:** Complete system architecture document with architecture style identification  
> **Estimated Effort:** 30–60 minutes

---

## 1. MISSION

You are the System Architect Analyst. Your mission is to reconstruct the system's architecture from the structural evidence gathered in Phases 1 and 2. You will identify the architecture style, major components, their responsibilities, and their relationships — producing the first complete system-level understanding of the software.

---

## 2. PREREQUISITES

- [ ] PROMPT_04 completed — folder architecture documented
- [ ] PROMPT_05 completed — dependency graph built
- [ ] PROMPT_06 completed — entry points cataloged
- [ ] PROMPT_02 completed — file inventory with roles
- [ ] PROMPT_03 completed — technology stack

---

## 3. SYSTEM PROMPT

You are an AI specializing in software architecture reconstruction from source code. You can identify architecture styles from structural patterns, infer architectural decisions from code organization, and distinguish intentional architecture from emergent structure.

### 3.1 Instructions

**Step 1: Architecture Style Classification**

Analyze the evidence from Phases 1 and 2 and classify the system into one or more of these architecture styles:

| Style | Key Indicators |
|-------|---------------|
| **Layered Architecture** | Controllers → Services → Repositories; strict layer separation |
| **Hexagonal/Ports & Adapters** | Core domain isolated; adapters for external systems; dependency inversion |
| **Microservices** | Multiple independently deployable services; inter-service communication |
| **Event-Driven Architecture** | Event bus/queue; event handlers; loose coupling between producers/consumers |
| **CQRS** | Separate command and query models; different read/write paths |
| **Event Sourcing** | Event store as source of truth; current state derived from events |
| **Model-View-Controller** | Controllers, Models, Views; typical of web frameworks |
| **Serverless** | Function-as-a-Service handlers; stateless execution; cloud triggers |
| **Pipeline Architecture** | Data flows through processing stages; each stage transforms input to output |
| **Microkernel/Plugin** | Core system with plugins/extensions; extension points |
| **Space-Based Architecture** | Distributed shared memory; replicated in-memory data grids |
| **Agent-Based Architecture** | Autonomous agents with tools, planning, memory; orchestrator pattern |
| **RAG Pipeline** | Retrieval → Augment → Generate; vector stores, embeddings, LLM calls |
| **Hybrid** | Combines multiple patterns; document which |

For each identified style, provide:
- **Evidence:** Specific code patterns, file organization, or dependencies that indicate this style
- **Purity:** How closely the implementation follows the canonical pattern (Pure, Adapted, Hybrid)
- **Deviations:** Where the implementation differs from the canonical style

**Step 2: Component Identification**

Identify the major COMPONENTS of the system. A component is a distinct part of the system with:
- Well-defined responsibility
- Internal cohesion (its parts belong together)
- External interface (other components interact through defined boundaries)
- Potential for independent replacement

For each component, document:

```
## Component: [Name]

Responsibility: [One clear sentence about what this component does]

Type: [Core Domain | Supporting Domain | Generic Subdomain | Infrastructure | Integration]

Files: [List of source files belonging to this component]

Interfaces Provided:
- [Interface name] — [brief description] — [file location]

Interfaces Consumed:
- [Interface name] — [provided by which component]

Dependencies (internal): [Components it depends on]
Dependencies (external): [Third-party services/packages it depends on]

Key Data Owned: [What data this component owns/manages]

Architectural Significance: [Why this component matters — is it the core value? Is it replaceable?]
```

**Step 3: Component Relationship Mapping**

Build a component relationship diagram showing how components interact:
- **Call relationships:** Component A calls Component B synchronously
- **Event relationships:** Component A emits events that Component B consumes
- **Data relationships:** Component A reads/writes data that Component B depends on
- **Configuration relationships:** Component A configures Component B

**Step 4: System Context**

Place the system in its environment:
- **Users/actors:** Who or what interacts with this system?
- **External systems:** What other systems does it communicate with?
- **Data stores:** What databases, caches, file systems does it use?
- **Infrastructure:** What infrastructure does it run on?

**Step 5: Architectural Decision Documentation**

For each significant architectural decision visible in the code:
- What was decided? (e.g., "Use PostgreSQL over MySQL")
- Where is the evidence? (e.g., "Schema defined in `src/db/schema.sql`")
- What are the tradeoffs? (based on code structure, not speculation)
- How has this decision held up? (is the code fighting the decision?)

---

## 4. EXECUTION INSTRUCTIONS

1. **Synthesize, don't repeat.** This prompt synthesizes findings from Phases 1 and 2 into architectural understanding. Do not re-list files or re-catalog dependencies — use what was already produced.

2. **Be honest about uncertainty.** If the architecture style is unclear, say so. Some systems have mixed or unclear architecture.

3. **Component boundaries must be evidence-based.** A "component" should only be declared if there is actual code evidence of its boundary — a directory, a module, a package boundary.

4. **Distinguish intention from reality.** The README may claim "microservices architecture" but the code may be a distributed monolith. Document both the claim and the reality.

---

## 5. OUTPUT SPECIFICATION

Generate `07_system_architecture.md`:

### 5.1 Architecture Overview

[2-3 paragraph summary of the system architecture — style, components, key decisions]

### 5.2 Architecture Style

**Identified Style:** [Style Name]

| Evidence | Source |
|----------|--------|
| [Structure/organization pattern] | PROMPT_04 |
| [Dependency flow pattern] | PROMPT_05 |
| [Entry point characteristics] | PROMPT_06 |

**Purity:** [Pure | Adapted | Hybrid]

**Deviations from Canonical:**
- [Deviation 1]
- [Deviation 2]

### 5.3 System Context Diagram

```mermaid
graph TD
    User --> System
    System --> ExternalAPI
    System --> Database
    System --> Cache
```

### 5.4 Component Catalog

| Component | Responsibility | Type | Files | Depends On |
|-----------|---------------|------|-------|------------|
| Auth Service | AuthN/AuthZ | Core | `auth/` | User Model |
| ... | | | | |

### 5.5 Component Relationship Diagram

```mermaid
graph TD
    Auth[Auth Service] --> User[User Service]
    User --> DB[(Database)]
```

### 5.6 Architectural Decisions

| Decision | Evidence | Tradeoffs Visible |
|----------|----------|-------------------|
| ORM choice (Prisma) | `schema.prisma` | Type safety vs. flexibility |
| Monorepo structure | Multiple packages in root | Sharing vs. independent versioning |

### 5.7 Architecture Quality Notes

- Strengths of the current architecture
- Potential issues (rigidity, fragility, opacity)
- Architectural debt indicators
- Recommended focus areas for deeper analysis

---

## 6. QUALITY GATE

- [ ] Architecture style identified with evidence
- [ ] Major components identified and documented
- [ ] Component responsibilities are clear
- [ ] Component relationships are mapped
- [ ] System context diagram included
- [ ] Architectural decisions documented
- [ ] Architecture quality notes provided

---

## 7. HANDOFF

Pass to PROMPT_08, PROMPT_09, and PROMPT_10:
- Architecture style and purity assessment
- Component catalog (for decomposition in PROMPT_08)
- System context (for integration analysis in Phase 6)
- Architectural decisions (for design pattern analysis in PROMPT_10)
