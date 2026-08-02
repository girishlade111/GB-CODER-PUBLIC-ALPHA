# PROMPT DESIGN GUIDE

> A guide to how this prompt framework is designed, the engineering decisions behind it, and how to extend it for specific use cases.

---

## 1. DESIGN PRINCIPLES

### 1.1 Modularity

Each prompt is a self-contained unit with:
- Defined inputs (what it needs to know)
- Defined outputs (what it produces)
- Defined dependencies (what prompts must come before)
- Defined success criteria (what "done" looks like)

This modularity enables:
- **Reuse** — Individual prompts can be extracted and used in other contexts
- **Testing** — Each prompt can be tested independently
- **Replacement** — A prompt can be swapped without affecting the rest of the pipeline
- **Parallelization** — Independent prompts can run simultaneously

### 1.2 Separation of Concerns

Each prompt has EXACTLY ONE analytical concern:
- PROMPT_04 only analyzes folder structure
- PROMPT_11 only analyzes data flow
- PROMPT_14 only analyzes error handling
- PROMPT_16 only analyzes prompt architecture

If a prompt starts covering topics from another prompt's domain, THAT IS A DESIGN DEFECT. This separation ensures:
- No duplicate analysis
- Clear ownership of each analytical dimension
- Consistent depth across all dimensions
- Verifiable completeness

### 1.3 Progressive Deepening

The framework employs a **funnel architecture**: each phase narrows scope but deepens analysis.

```
Phase 1:       ████████████████████████████████  (100% files, shallow)
Phase 2:       ████████████████████████████████  (100% files, structural)
Phase 3:       ██████████████████████░░░░░░░░░░  (80% files, architectural)
Phase 4:       ████████████░░░░░░░░░░░░░░░░░░░░  (40% files, deep)
Phase 5:       ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  (20% files, AI-specific)
Phase 6:       ████████████████████░░░░░░░░░░░░  (60% files, integration)
Phase 7:       ████████████████████████████████  (100% consolidation)
Phase 8:       ████████████████████████████████  (100% verification)
```

### 1.4 Fail-Fast Detection

Each phase includes early detection of analysis blockers:
- Can this phase produce useful output with its available input?
- Are there clear structural obstacles (binary files, missing source, generated code)?
- Should this phase be reduced in scope or refocused?

If a phase detects it cannot produce meaningful output within its scope, it documents this immediately rather than producing low-quality work and passing the problem downstream.

---

## 2. PROMPT STRUCTURE PATTERN

Every prompt follows this template. The rationale for each section:

| Section | Purpose | Why It Exists |
|---------|---------|---------------|
| **Mission** | Sets scope and boundaries | Prevents scope creep; the agent knows exactly what this prompt covers |
| **Prerequisites** | Lists required context | Prevents garbage-in-garbage-out; fails fast if context is missing |
| **System Prompt** | The executable prompt text | The core — what the agent actually runs |
| **Execution Instructions** | How to run the prompt | Removes ambiguity about procedure |
| **Output Specification** | What to produce | Ensures consistent output structure across runs |
| **Quality Gate** | Success criteria | Prevents incomplete work from being handed off |
| **Handoff** | Context for next prompt | Ensures pipeline continuity |

---

## 3. CONTEXT MANAGEMENT STRATEGY

### 3.1 The Context Wall Problem

AI agents have finite context windows. A complete reverse engineering of a large repository can exceed any available context window. This framework addresses this through:

1. **Summarized handoffs** — Each phase produces a 1–2 page context summary, not the full output
2. **Referential architecture** — The agent reads from files, not memory
3. **Lazy analysis** — Details are analyzed when needed, not pre-computed
4. **Checkpointing** — Each phase can be resumed independently

### 3.2 Handoff Size Budget

| Phase | Context Summary Size | Rationale |
|-------|---------------------|-----------|
| 1→2 | ≤ 2 pages | Just inventory and stack |
| 2→3 | ≤ 3 pages | Structural skeleton |
| 3→4 | ≤ 5 pages | Architecture map |
| 4→5 | ≤ 5 pages | Code depth findings |
| 4→6 | ≤ 3 pages | Code depth subset for integration |
| 5→6 | ≤ 3 pages | AI-specific findings |
| 6→7 | ≤ 5 pages | Complete system map |
| 7→8 | ≤ 2 pages | Documentation map |
| 8→9 | ≤ 3 pages | Validation gaps |

### 3.3 Reference Document Strategy

For complex details that exceed the handoff budget:
- Save reference details to `_analysis/` directory
- Handoff includes only the summary and a pointer to the detailed file
- The downstream prompt reads the detailed file on demand

---

## 4. LANGUAGE-SPECIFIC ADAPTATION

### 4.1 Generic vs. Language-Specific

The framework is language-agnostic. However, specific languages benefit from targeted analysis:

| Language | Special Consideration | Framework Adaptation |
|----------|----------------------|---------------------|
| Python | Dynamic typing, decorators, metaclasses | Track runtime type resolution, document decorator chains |
| JavaScript/TypeScript | Async patterns, module systems, prototypes | Document promise chains, transpilation targets |
| Java | Inheritance hierarchies, reflection, DI frameworks | Trace class hierarchies, annotation processing |
| Rust | Ownership, borrowing, lifetimes, unsafe blocks | Document ownership chains, unsafe regions |
| Go | Goroutines, channels, interfaces | Document concurrency model, interface satisfaction |
| C/C++ | Macros, pointers, manual memory, templates | Document memory ownership, macro expansion effects |
| C# | LINQ, async/await, reflection, attributes | Document expression trees, async state machines |

### 4.2 Adaptation Mechanism

When the target language is detected in Phase 1:
1. Load the language-specific analysis rules from the AI's knowledge
2. Adjust analysis depth for language-specific constructs
3. Prioritize code patterns that are idiomatic to the language
4. Document any language-specific anti-patterns found

---

## 5. EXTENDING THE FRAMEWORK

### 5.1 Adding a New Prompt

1. Identify the gap in the current analysis
2. Determine which phase the new prompt belongs to (or create a new phase)
3. Determine input dependencies (what previous prompts must produce)
4. Determine output artifacts (what downstream prompts need)
5. Write the prompt following the standard template
6. Update PROMPT_DEPENDENCY_MAP.md
7. Update MASTER_INDEX.md
8. Create any needed diagram templates or validation checklists
9. Version bump the framework (MINOR for additions)

### 5.2 Adding a New Phase

1. Define the phase scope and objective
2. Determine where it fits in the pipeline order
3. Design 1–5 prompts for the phase
4. Define the input contract from the previous phase
5. Define the output contract to the next phase
6. Create all prompt files
7. Update PROMPT_DEPENDENCY_MAP.md with the new phase's dependencies
8. Update MASTER_INDEX.md
9. Update all affected handoff specifications
10. Create phase-specific quality standards if needed
11. Version bump the framework (MINOR for new phase)

### 5.3 Customizing for a Domain

To adapt this framework for a specific domain (e.g., game engines, financial systems, embedded firmware):

1. **Phase 1 modification** — Add domain-specific file pattern detection
2. **Phase 3 modification** — Add domain-specific architecture patterns to recognize
3. **Phase 4 modification** — Add domain-specific code analysis patterns
4. **Phase 6 modification** — Add domain-specific integration patterns
5. **Phase 7 modification** — Add domain-specific documentation templates

---

## 6. COMMON PITFALLS

### 6.1 Analysis Pitfalls

| Pitfall | Symptom | Prevention |
|---------|---------|------------|
| Shallow reading | Documentation says "complex system" without detail | Enforce per-function analysis requirement |
| Confirmation bias | Documentation matches expected patterns instead of actual code | Require code citations for every claim |
| Missing dynamic behavior | Static analysis misses runtime polymorphism | Flag all dynamic dispatch for manual review |
| Over-abstraction | Everything is described as "a service" when it's really 5 different patterns | Require precise pattern names |
| Circular explanation | "Module A handles X, which depends on B which handles Y, which depends on A" | Enforce directed acyclic analysis |

### 6.2 Framework Pitfalls

| Pitfall | Symptom | Prevention |
|---------|---------|------------|
| Skipping phases | Output is shallow | Hard dependency enforcement in handoff |
| Context overload | Agent loses detail from earlier phases | Mandatory context summaries |
| Inconsistent terminology | Same concept named differently in different outputs | GLOSSARY.md enforcement |
| Output bloat | 500 pages of irrelevant detail | Scope definition per prompt |
| Forgetting the reader | Documentation that only makes sense to the analyzer | Reader persona definition in each prompt |
