# PROJECT SPECIFICATION

> The formal specification of the Enterprise Reverse Engineering Prompt Framework — its architecture, components, interfaces, and behavioral contracts.

---

## 1. FRAMEWORK IDENTIFICATION

| Attribute | Value |
|-----------|-------|
| Framework Name | Enterprise Reverse Engineering Prompt Framework |
| Version | 1.0 |
| Versioning Scheme | Semantic: MAJOR.MINOR.PATCH (breaking changes, additions, fixes) |
| Classification | Enterprise Prompt Architecture |
| Domain | Software Reverse Engineering |
| Delivery Format | Modular Prompt Project (Multiple .md files) |
| Runtime | AI Agent (any capable LLM-based system) |
| Language | English (framework). Repository language: any |

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

The framework is a **pipeline architecture** with 9 phases. Each phase is a processing stage that transforms a specific input into a specific output. The pipeline is mostly sequential, with limited parallelization at defined join points.

```
[Repository] 
    → Phase 1: DISCOVERY (inventory, stack detection)
    → Phase 2: STRUCTURAL ANALYSIS (architecture skeleton)
    → Phase 3: ARCHITECTURE RECONSTRUCTION (component map)
    → Phase 4: DEEP CODE ANALYSIS (code-level understanding)
    → [Branch Point]
        ├─ → Phase 5: AI & AUTOMATION ANALYSIS (if AI patterns detected)
        └─ → (skip if no AI patterns)
    → Phase 6: INTEGRATION & BOUNDARIES
    → Phase 7: DOCUMENTATION GENERATION
    → Phase 8: VALIDATION & QUALITY
    → Phase 9: REBUILD PACKAGE (optional)
    → [Complete Documentation Set]
```

### 2.2 Component Architecture

The framework consists of three architectural layers:

**Layer 1: Infrastructure** — Non-executable configuration files
- MASTER_INDEX.md
- MISSION.md
- OPERATING_RULES.md
- QUALITY_STANDARDS.md
- OUTPUT_RULES.md
- PROJECT_SPECIFICATION.md
- PROMPT_DESIGN_GUIDE.md
- FRAMEWORK_DESIGN_PHILOSOPHY.md
- PROMPT_DEPENDENCY_MAP.md
- GLOSSARY.md
- DIAGRAM_TEMPLATES.md
- VALIDATION_CHECKLISTS.md

**Layer 2: Orchestration** — The executable master prompt
- MASTER_PROMPT.md

**Layer 3: Execution** — 35 executable prompt files organized in 9 phases

### 2.3 Data Flow

```
Repository → INFRASTRUCTURE LAYER (rules, standards)
                ↓
           ORCHESTRATION LAYER (phase selection, ordering, context management)
                ↓
           EXECUTION LAYER
                ↓
           Phase 1 → Phase 2 → Phase 3 → Phase 4 →+→ Phase 6 → Phase 7 → Phase 8 → Phase 9
                                                     ↑
                                               Phase 5 (conditional)
                ↓
           OUTPUT: Complete documentation set
```

---

## 3. PROMPT FILE SPECIFICATION

### 3.1 Structure of a Prompt File

Every prompt file in this framework follows a strict structure:

```markdown
# Prompt NN: [Name]

> **Phase:** [N] — [Phase Name]  
> **Dependencies:** [List of prerequisite prompts]  
> **Input Required:** [List of required artifacts/files]  
> **Output Produced:** [List of output artifacts]  
> **Estimated Effort:** [Time estimate for a capable AI agent]

---

## 1. MISSION

One paragraph stating what this specific prompt is designed to achieve.

## 2. PREREQUISITES

Required context, artifacts, and understanding from previous prompts.

## 3. SYSTEM PROMPT

[The actual system prompt that the AI agent will execute]

[This section contains the executable instructions — analysis methodology, 
verification steps, output requirements]

## 4. EXECUTION INSTRUCTIONS

Step-by-step instructions for executing this prompt.

## 5. OUTPUT SPECIFICATION

Detailed specification of what the output must contain.

## 6. QUALITY GATE

Specific quality checks that must pass before proceeding.

## 7. HANDOFF

What context to pass to the next prompt.
```

### 3.2 The SYSTEM PROMPT Section

The SYSTEM PROMPT section of each file contains the most critical content — it is the actual prompt text that would be loaded into an AI agent's system context. It includes:

- Role definition (what persona the agent should adopt)
- Context from previous phases (summarized)
- Task definition (what to do)
- Methodology (how to do it)
- Constraints (what not to do)
- Output format (what to produce)
- Quality criteria (how to measure success)

### 3.3 Runtime Requirements

Each prompt file requires:
- An AI agent with code-reading capability (minimum 32K context, 128K+ recommended)
- File system access to the repository
- Ability to generate Mermaid diagrams (or alternative diagram tool)
- Ability to write structured markdown

---

## 4. INTERFACE DEFINITION

### 4.1 Prompt-to-Input Interface

Each prompt reads from:
- The repository directory (primary source)
- Output files from previous prompts (secondary source)
- The infrastructure files (operating context)

### 4.2 Prompt-to-Output Interface

Each prompt produces:
- One or more markdown documentation files
- An optional status entry in the phase tracking system
- Context summary for the next prompt

### 4.3 Cross-Prompt Contract

The contract between consecutive prompts is a **Context Summary** — a structured markdown block that the producing prompt creates and the consuming prompt requires:

```markdown
## CONTEXT SUMMARY [Phase N → Phase N+1]

Key findings:
- [List of 3-5 most important findings]

Files of interest:
- [List of architecturally significant files]

Ambiguities remaining:
- [List of unresolved questions]

Priority items for next phase:
- [What the next phase should focus on]
```

---

## 5. ERROR HANDLING

### 5.1 Analysis Errors

| Error | Handling Strategy |
|-------|-------------------|
| File unreadable | Document error, skip, flag for manual review |
| Unparseable syntax | Document location and error type, analyze rest of file |
| Missing files referenced in imports | Document as dependency gap, continue analysis |
| Circular dependencies | Map the cycle, document it, flag as architectural concern |
| Dynamic behavior (reflection/eval) | Document as "dynamic — requires runtime analysis" |

### 5.2 Framework Errors

| Error | Handling Strategy |
|-------|-------------------|
| Prompt out of order | Check dependency map, reorder, log correction |
| Missing prerequisite | Skip to last completed phase, flag gap |
| Resource exhaustion (context limit) | Split analysis into sub-requests, aggregate results |
| Time constraint | Produce partial output, mark as `[INCOMPLETE]` |

---

## 6. EXTENSIBILITY

### 6.1 Extension Points

The framework is designed for extension at these points:

| Extension Point | How to Extend | Example |
|----------------|---------------|---------|
| New analysis phase | Add new PROMPT_NN file, update DEPENDENCY_MAP | Phase 10: Security Analysis |
| New diagram type | Add to DIAGRAM_TEMPLATES.md | C4 model diagrams |
| New quality standard | Add to QUALITY_STANDARDS.md | Performance analysis standard |
| New output artifact | Update OUTPUT_RULES.md, add template | Interactive HTML docs |
| Language-specific analysis | Add to PROMPT_DESIGN_GUIDE.md | Rust ownership analysis |

### 6.2 Version Compatibility

- Adding a new prompt file: MINOR version bump
- Adding a new phase: MINOR version bump
- Restructuring existing prompts: MAJOR version bump
- Fixing errors in prompts: PATCH version bump
- Updating quality standards: PATCH version bump
- Breaking changes to output contracts: MAJOR version bump

---

## 7. PERFORMANCE CHARACTERISTICS

| Metric | Expected | Notes |
|--------|----------|-------|
| Small repo (<50 files) | 1–2 hours AI time | 15–25K tokens input per phase |
| Medium repo (50–500 files) | 4–8 hours AI time | 30–50K tokens input per phase |
| Large repo (500–5000 files) | 16–40 hours AI time | May need sub-sampling |
| Monorepo (>5000 files) | 40+ hours AI time | Requires architectural scoping |
| Output per phase | 5–25 pages markdown | Dependent on repo complexity |
| Total output (complete) | 50–500 pages | All phases combined |
