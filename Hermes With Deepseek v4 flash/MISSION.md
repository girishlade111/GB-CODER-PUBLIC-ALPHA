# MISSION

---

## CORE MISSION STATEMENT

To produce a **complete, accurate, and actionable** reverse engineering of any software repository by systematically analyzing its structure, code, dependencies, workflows, and design decisions — producing documentation of such quality that any competent engineer can fully understand, modify, extend, or rebuild the system from the documentation alone.

---

## WHY THIS FRAMEWORK EXISTS

Software repositories are knowledge silos. The design intent, architectural decisions, and operational knowledge encoded in source code are invisible to everyone who did not write it. This framework exists to:

1. **Extract knowledge from code** — transform implicit design into explicit documentation
2. **Preserve architectural intent** — capture not just what the code does, but why it was designed that way
3. **Enable knowledge transfer** — allow new engineers, auditors, and AI systems to understand any repository
4. **Support rebuild and migration** — provide sufficient detail to rebuild a system from scratch
5. **Identify improvement opportunities** — surface architectural debt, anti-patterns, and optimization targets
6. **Accelerate onboarding** — replace weeks of code reading with structured documentation hours

---

## SCOPE

### What this framework covers:

- Any programming language (compiled, interpreted, transpiled)
- Any software domain (web, mobile, desktop, embedded, AI/ML, data pipeline, infrastructure)
- Any repository size (single file to multi-repo monorepo)
- Any architecture style (monolithic, microservices, event-driven, serverless, agent-based)
- Any AI maturity (no AI components to complex multi-agent systems)

### What this framework does NOT cover:

- Security vulnerability exploitation (this is for understanding, not attacking)
- Legal/forensic reverse engineering (no binary decompilation or DRM circumvention)
- Performance benchmarking (architecture understanding, not runtime profiling — though performance architecture is analyzed)
- Code modification (analysis only; no code generation or refactoring)

---

## CORE PRINCIPLES

### 1. Understanding Before Documentation

**No documentation is written until the system is fully understood.** Every prompt in this framework enforces a "understand first, document second" discipline. Premature documentation produces inaccurate, surface-level artifacts that mislead future readers.

### 2. Systematic Depth

Analysis proceeds in ordered phases, each building on the previous. No phase is skipped. Each phase achieves a specific depth of understanding before the next begins. This prevents the common failure mode of "wide but shallow" analysis.

### 3. Multi-Resolution Analysis

The framework operates at multiple levels of abstraction simultaneously:
- **Macro:** System architecture, organizational structure, deployment topology
- **Meso:** Component responsibilities, module dependencies, communication patterns
- **Micro:** Function behavior, state transitions, error handling, edge cases

Every finding at one level must be traceable to implementation at the next level down and justifiable at the level above.

### 4. Precision Over Generality

Specificity is always preferred over vague statements. Every claim about code behavior must be traceable to specific files, line numbers, and code paths. "The system uses a pub/sub pattern" is insufficient — "The system implements a publish-subscribe pattern via `EventBus.ts` (lines 45–120) using TypeScript generics with typed event channels defined in `events.ts` (lines 1–80)" is the standard.

### 5. Verifiability

Every generated artifact must be independently verifiable. Claims about architecture must be supported by code evidence. Claims about behavior must be supported by execution traces or test evidence. Claims about intent must be supported by documentation, comments, or commit messages.

### 6. Completeness Over Conciseness

When completeness and conciseness conflict, completeness wins. Incomplete documentation produces false confidence. Engineers who rely on incomplete documentation make incorrect assumptions. The framework is designed for production systems where missing information causes real failures.

### 7. Structured Output

All documentation is produced in structured formats that can be:
- Read by humans (clear markdown, diagrams)
- Processed by tools (JSON, YAML, structured sections)
- Checked for completeness (checklists, validation gates)
- Diffed across versions (consistent structure)

---

## SUCCESS CRITERIA

An analysis is complete when:

1. **Every file** in the repository has its role documented
2. **Every function** has its purpose, inputs, outputs, and side effects documented
3. **Every data flow** from source to sink is traced
4. **Every execution path** from entry point to terminal state is mapped
5. **Every state transition** in the system is documented
6. **Every external dependency** is cataloged with its purpose
7. **Every design pattern** is identified with its specific implementation locations
8. **Every configuration point** is documented with its effects
9. **Every error handling path** is documented
10. **Every AI prompt, agent, tool, and workflow** (if applicable) is fully reverse-engineered
11. **The system can be rebuilt** from the documentation alone (if rebuild guide is generated)
12. **A new engineer** can understand, modify, and extend the system after reading the documentation

---

## CONSTRAINTS

1. **No code modification.** This is analysis-only. Do not fix, refactor, optimize, or otherwise modify the code during analysis.
2. **No assumptions.** Every claim must be evidence-based. If code behavior is ambiguous, document the ambiguity, do not guess.
3. **No opinion.** Document what the code does, not what it should do. Separate observations from recommendations.
4. **No truncation.** Analysis is complete or it is not done. Partial analysis is flagged as incomplete.
5. **No fabrication.** If a code path cannot be fully traced, document the gap. Do not invent plausible completions.
6. **Traceability preserved.** All documentation must include file paths and line numbers for every claim about code.
