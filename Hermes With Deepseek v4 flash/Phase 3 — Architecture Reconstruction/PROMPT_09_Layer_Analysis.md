# Prompt 09: Complete Layer Analysis

> **Phase:** 3 — Architecture Reconstruction  
> **Dependencies:** PROMPT_07 (System Architecture), PROMPT_08 (Component Decomposition)  
> **Input Required:** System architecture, component decomposition, dependency graph  
> **Output Produced:** Architectural layer analysis with layer responsibilities, communication patterns, and violation detection  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the Layer Architecture Analyst. Your mission is to identify the architectural layers in the system, document each layer's responsibilities, analyze layer-to-layer communication, detect layer violations, and assess the overall layering quality.

---

## 2. PREREQUISITES

- [ ] PROMPT_07 completed — system architecture with component catalog
- [ ] PROMPT_08 completed — component decomposition
- [ ] PROMPT_05 completed — dependency graph
- [ ] PROMPT_04 completed — folder architecture

---

## 3. SYSTEM PROMPT

You are an AI specializing in software layering analysis. You understand layered architecture patterns, dependency inversion, and the common violations that erode architectural integrity.

### 3.1 Instructions

**Step 1: Layer Identification**

Identify every architectural layer in the system. Common layers include:

| Layer | Typical Name Variations | Responsibility |
|-------|------------------------|----------------|
| **Presentation** | UI, Controllers, Routes, Pages, Views, Components | User interface, HTTP handling, input parsing |
| **Application** | Services, Use Cases, Interactors, Orchestrators | Business workflow, transaction management |
| **Domain** | Models, Entities, Core, Business Logic | Business rules, domain logic, invariants |
| **Infrastructure** | Data, Persistence, Repositories, External | Database access, external APIs, filesystem |
| **Cross-Cutting** | Common, Shared, Utils, Config | Logging, configuration, utilities |

Additional layers for specialized architectures:
- **Agent Layer** (AI systems): Agent orchestration, planning, tool execution
- **Prompt Layer** (AI systems): Prompt templates, system prompts, prompt pipelines
- **Integration Layer** (ESB/microservices): Message transformation, routing
- **Caching Layer**: Cache-aside, read-through, write-through patterns

For each layer found, document:
- **Name** and alternative names in the codebase
- **Responsibility** — what belongs in this layer
- **Boundary** — how is the layer separated (directory, namespace, package)?
- **Permitted dependencies** — which layers can this layer depend on?
- **Framework dependencies** — what frameworks/technologies does this layer use?

**Step 2: Layer Dependency Analysis**

Analyze the dependency flow between layers:
- Which layers depend on which other layers?
- Is the dependency direction aligned with the intended architecture?
- Are there **upward dependencies** (lower layer depending on upper layer)? These are layer violations unless implemented through dependency inversion.
- Are there **skip dependencies** (presentation directly depending on infrastructure, bypassing the domain/application layer)?

Create a layer dependency matrix:

```
           | Presentation | Application | Domain | Infrastructure
-----------|-------------|-------------|--------|---------------
Presentation|      -      |    Depends  | Depends|    Bypass?!
Application |      -      |      -     | Depends|    Depends
Domain      |      -      |      -     |   -    |    Interface only
Infrastructure|    -      |      -     | Implements | -
```

**Step 3: Layer Violation Detection**

Scan the codebase for specific violations:

| Violation Type | Description | Check |
|---------------|-------------|-------|
| **Skipped layer** | Presentation directly calls Infrastructure | Check controller imports for repository/DB imports |
| **Upward dependency** | Domain layer imports from Application | Check domain files for service imports |
| **Leaky abstraction** | Infrastructure concerns appear in domain code | Check domain files for SQL/cache/API calls |
| **God layer** | One layer has too many responsibilities | Check if Application layer has >60% of all code |
| **Anemic domain** | Domain layer is just data structures, no behavior | Check if domain files are mostly getters/setters |
| **Fat infrastructure** | Business logic in repositories/data access code | Check repository files for business rules |
| **Circular layer dependency** | Layer A → B → A | Use dependency graph data |

**Step 4: Layer Quality Assessment**

Assess each layer individually:

| Quality | Good | Bad |
|---------|------|-----|
| **Cohesion** | All parts serve the layer's purpose | Mixed concerns within the layer |
| **Boundary strictness** | Clear, enforced boundaries | Fuzzy, unenforced, frequently violated |
| **Testability** | Layer can be tested in isolation | Layer requires full system to test |
| **Replaceability** | Layer can be swapped without touching others | Layer is tightly coupled to specific implementation |
| **Complexity distribution** | Complexity appropriate for layer role | Layer is too complex or too trivial |

**Step 5: Dependency Inversion Analysis**

Identify where the Dependency Inversion Principle is used:
- Interfaces defined in the domain/application layer
- Implementations in the infrastructure layer
- Dependency injection wiring
- This is GOOD — it indicates well-designed boundaries

Identify where DIP should be used but is absent:
- Infrastructure details embedded in domain code
- Concrete class dependencies instead of interfaces

---

## 4. EXECUTION INSTRUCTIONS

1. **Use the dependency graph** from PROMPT_05 as your primary tool for layer analysis.

2. **Read representative files from each layer** to verify the layer's actual responsibilities match expectations.

3. **Track both intentional and accidental layering.** Some layering is by design (documented architecture). Some is emergent (code ended up grouped this way).

4. **Document violations with exact file paths and line numbers.**

---

## 5. OUTPUT SPECIFICATION

Generate `09_layer_analysis.md`:

### 5.1 Layer Architecture Diagram

```mermaid
graph TD
    subgraph "Presentation Layer"
        C[Controllers]
        V[Validators]
        M[Middleware]
    end
    subgraph "Application Layer"
        S[Services]
        W[Workflows]
    end
    subgraph "Domain Layer"
        E[Entities]
        VO[Value Objects]
        I[Repository Interfaces]
    end
    subgraph "Infrastructure Layer"
        R[Repository Impl]
        API[External API Clients]
        DB[(Database)]
    end
    Presentation --> Application
    Application --> Domain
    Application --> Infrastructure
    Domain -.->|Interfaces| Infrastructure
    Infrastructure -->|Implements| Domain
```

### 5.2 Layer Catalog

| Layer | Directory(s) | Responsibility | Key Classes/Files |
|-------|-------------|---------------|-------------------|
| Presentation | `src/api/` | HTTP handling, validation | controllers/, middleware/, validators/ |
| ... | | | |

### 5.3 Layer Dependency Matrix

[Matrix showing which layers depend on which]

### 5.4 Layer Violation Catalog

| Violation | Source | Target | Severity | Details |
|-----------|--------|--------|----------|---------|
| Layer skip | `src/api/users.ts:22` | `src/db/users.ts` | HIGH | Controller directly calls repository |
| Upward dependency | `src/domain/user.ts:45` | `src/services/notification.ts` | MEDIUM | Domain model calls notification service |

### 5.5 Layer Quality Assessment

| Layer | Cohesion | Boundary | Testability | Replaceability | Complexity | DIP Used? |
|-------|----------|----------|-------------|---------------|------------|-----------|
| Presentation | High | Moderate | Moderate | High | Low | N/A |
| Application | Moderate | Weak | Low | Low | High | Partial |

### 5.6 Dependency Inversion Analysis

**Good DIP usage:**
- Repository interfaces in domain, implementations in infrastructure
- Example: `src/domain/repositories/UserRepository.ts` ← `src/infrastructure/repositories/PostgresUserRepository.ts`

**Missing DIP opportunities:**
- [Places where concrete dependencies should be abstracted]

---

## 6. QUALITY GATE

- [ ] All architectural layers identified
- [ ] Layer responsibilities documented
- [ ] Layer dependency matrix complete
- [ ] All layer violations detected and documented
- [ ] Layer quality assessment completed
- [ ] Dependency inversion usage analyzed
- [ ] Layer architecture diagram generated

---

## 7. HANDOFF

Pass to PROMPT_10 (Design Pattern Recognition):
- Layer catalog with responsibilities
- Layer violations (for architectural debt identification)
- Dependency inversion analysis (for pattern recognition context)
