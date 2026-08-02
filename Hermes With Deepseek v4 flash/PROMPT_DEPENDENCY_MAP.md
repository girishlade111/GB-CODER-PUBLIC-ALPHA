# PROMPT DEPENDENCY MAP

> Directed dependency graph showing which prompts depend on which outputs. Use this to understand execution order and to identify parallelization opportunities.

---

## DEPENDENCY GRAPH

```
PROMPT_01 (Repository Scan)
    │
    ├──→ PROMPT_02 (File Inventory) ←── depends on scan results
    │
    └──→ PROMPT_03 (Technology Stack) ←── depends on scan + inventory
              │
              └──→ PROMPT_04 (Folder Architecture) ←── depends on inventory + stack
                       │
                       ├──→ PROMPT_05 (Module Dependency Graph) ←── depends on folder architecture
                       │
                       └──→ PROMPT_06 (Entry Point Analysis) ←── depends on folder architecture
                                │
                                └──→ PROMPT_07 (System Architecture) ←── depends on 04 + 05 + 06
                                         │
                                         ├──→ PROMPT_08 (Component Decomposition)
                                         │
                                         ├──→ PROMPT_09 (Layer Analysis)
                                         │
                                         └──→ PROMPT_10 (Design Pattern Recognition)
                                                  │
                                                  └──→ PROMPT_11 (Data Flow Analysis)
                                                           │
                                                           ├──→ PROMPT_12 (Execution Path Reconstruction)
                                                           │
                                                           ├──→ PROMPT_13 (State Management)
                                                           │
                                                           └──→ PROMPT_14 (Error Handling & Retry)
                                                                    │
                                                                    └──→ PROMPT_15 (Concurrency & Performance)
                                                                             │
                                                                             ├──→ [CONDITIONAL] PROMPT_16 (Prompt Architecture) ──┐
                                                                             │        ONLY if AI prompts detected               │
                                                                             │                                                   │
                                                                             └──→ [CONDITIONAL] PROMPT_17 (Agent Workflow) ──────┤
                                                                                      ONLY if AI agents detected              │
                                                                                                                              │
                                                                              ┌──────────────────────────────────────────────────┘
                                                                              │
                                                                              ▼
                                                                     PROMPT_18 (Tool Integration)
                                                                              │
                                                                              ├──→ PROMPT_19 (Planning/Reasoning Pipeline) ──→ OPTIONAL (AI systems)
                                                                              │
                                                                              └──→ PROMPT_20 (Memory/RAG Workflow) ──→ OPTIONAL (AI systems)
                                                                                       │
                                                                                       ▼
                                                                              PROMPT_21 (Internal API Contracts)
                                                                                       │
                                                                                       ├──→ PROMPT_22 (External Service Integration)
                                                                                       │
                                                                                       └──→ PROMPT_23 (Event Stream Workflow)
                                                                                                │
                                                                                                └──→ PROMPT_24 (Configuration & Environment)
                                                                                                         │
                                                                                                         ▼
                                                                                                PROMPT_25 (Architecture Handbook)
                                                                                                         │
                                                                                                         ├──→ PROMPT_26 (Developer Handbook)
                                                                                                         │
                                                                                                         ├──→ PROMPT_27 (Rebuild Guide)
                                                                                                         │
                                                                                                         └──→ PROMPT_28 (Complete Diagram Gen)
                                                                                                                  │
                                                                                                                  └──→ PROMPT_29 (Feature Map Catalog)
                                                                                                                           │
                                                                                                                           ▼
                                                                                                                  PROMPT_30 (Accuracy Cross-Validation)
                                                                                                                           │
                                                                                                                           ├──→ PROMPT_31 (Completeness Audit)
                                                                                                                           │
                                                                                                                           ├──→ PROMPT_32 (Consistency Verification)
                                                                                                                           │
                                                                                                                           └──→ PROMPT_33 (Final Quality Gate)
                                                                                                                                    │
                                                                                                                                    ├──→ PROMPT_34 (Rebuild Package Assembly) ──→ OPTIONAL
                                                                                                                                    │
                                                                                                                                    └──→ PROMPT_35 (Rebuild Verification) ──→ OPTIONAL
```

---

## DEPENDENCY TABLE

| Prompt | Name | Depends On | Satisfied By | Parallelizable |
|--------|------|-----------|-------------|----------------|
| 01 | Repository Scan | Nothing | — | No (first) |
| 02 | File Inventory | PROMPT_01 | PROMPT_01 output | With PROMPT_03 |
| 03 | Technology Stack Detection | PROMPT_01 | PROMPT_01 output | With PROMPT_02 |
| 04 | Folder Architecture | PROMPT_02, PROMPT_03 | PROMPT_02, PROMPT_03 outputs | No |
| 05 | Module Dependency Graph | PROMPT_04 | PROMPT_04 output | With PROMPT_06 |
| 06 | Entry Point Analysis | PROMPT_04 | PROMPT_04 output | With PROMPT_05 |
| 07 | System Architecture | PROMPT_04, 05, 06 | PROMPT_04, 05, 06 outputs | No |
| 08 | Component Decomposition | PROMPT_07 | PROMPT_07 output | With PROMPT_09, 10 |
| 09 | Layer Analysis | PROMPT_07 | PROMPT_07 output | With PROMPT_08, 10 |
| 10 | Design Pattern Recognition | PROMPT_07 | PROMPT_07 output | With PROMPT_08, 09 |
| 11 | Data Flow Analysis | PROMPT_08, 09, 10 | PROMPT_08, 09, 10 outputs | With PROMPT_12, 13 |
| 12 | Execution Path Reconstruction | PROMPT_11 | PROMPT_11 output | With PROMPT_11, 13 |
| 13 | State Management Analysis | PROMPT_11 | PROMPT_11 output | With PROMPT_11, 12 |
| 14 | Error Handling & Retry | PROMPT_11, 12, 13 | PROMPT_11, 12, 13 outputs | No |
| 15 | Concurrency & Performance | PROMPT_14 | PROMPT_14 output | No |
| 16 | Prompt Architecture | PROMPT_15 [IF AI detected] | PROMPT_15 output | With PROMPT_17 |
| 17 | Agent Workflow | PROMPT_15 [IF AI detected] | PROMPT_15 output | With PROMPT_16 |
| 18 | Tool Integration Analysis | PROMPT_15, 16, 17 | PROMPT_15, 16, 17 outputs | No |
| 19 | Planning/Reasoning Pipeline | PROMPT_18 [IF AI detected] | PROMPT_18 output | No |
| 20 | Memory/RAG Workflow | PROMPT_18 [IF AI detected] | PROMPT_18 output | No |
| 21 | Internal API Contracts | PROMPT_11, 12, 15 | PROMPT_11, 12, 15 outputs | With PROMPT_22 |
| 22 | External Service Integration | PROMPT_21 | PROMPT_21 output | With PROMPT_21 |
| 23 | Event Stream Workflow | PROMPT_21 | PROMPT_21 output | No |
| 24 | Configuration & Environment | PROMPT_21, 22, 23 | PROMPT_21, 22, 23 outputs | No |
| 25 | Architecture Handbook | All prior | All prior outputs | No |
| 26 | Developer Handbook | PROMPT_25 | PROMPT_25 output | With PROMPT_27, 28 |
| 27 | Rebuild Guide | PROMPT_25 | PROMPT_25 output | With PROMPT_26, 28 |
| 28 | Complete Diagram Generation | PROMPT_25 | PROMPT_25 output | With PROMPT_26, 27 |
| 29 | Feature Map Catalog | PROMPT_25, 26 | PROMPT_25, 26 outputs | No |
| 30 | Accuracy Cross-Validation | PROMPT_25-29 | All Phase 7 outputs | With PROMPT_31, 32 |
| 31 | Completeness Audit | PROMPT_25-29 | All Phase 7 outputs | With PROMPT_30, 32 |
| 32 | Consistency Verification | PROMPT_25-29 | All Phase 7 outputs | With PROMPT_30, 31 |
| 33 | Final Quality Gate | PROMPT_30, 31, 32 | PROMPT_30, 31, 32 outputs | No |
| 34 | Rebuild Package Assembly | PROMPT_27, 33 | PROMPT_27, 33 outputs | No |
| 35 | Rebuild Verification | PROMPT_34 | PROMPT_34 output | No |

---

## PARALLELIZATION OPPORTUNITIES

| Batch | Prompts | Can Run Together | Join Point |
|-------|---------|-----------------|------------|
| P1 | PROMPT_02, PROMPT_03 | Yes | Before PROMPT_04 |
| P2 | PROMPT_05, PROMPT_06 | Yes | Before PROMPT_07 |
| P3 | PROMPT_08, PROMPT_09, PROMPT_10 | Yes | Before PROMPT_11 |
| P4 | PROMPT_11, PROMPT_12, PROMPT_13 | Yes | Before PROMPT_14 |
| P5 | PROMPT_16, PROMPT_17 | Yes | Before PROMPT_18 |
| P6 | PROMPT_21, PROMPT_22 | Yes | Before PROMPT_23 |
| P7 | PROMPT_26, PROMPT_27, PROMPT_28 | Yes | Before PROMPT_29 |
| P8 | PROMPT_30, PROMPT_31, PROMPT_32 | Yes | Before PROMPT_33 |

---

## CONTEXT HANDOFF TABLE

Each handoff must include these fields:

| From Prompt | Context Items Transferred |
|-------------|--------------------------|
| PROMPT_01 | Repository path, initial scan findings, file count, notable patterns |
| PROMPT_02 | Complete file inventory (categorized), exclusion list |
| PROMPT_03 | Language, framework, library, tool inventory with versions |
| PROMPT_04 | Directory structure map, naming conventions, package organization |
| PROMPT_05 | Dependency graph (internal + external), circular dependency warnings |
| PROMPT_06 | All entry points with signatures, invocation methods |
| PROMPT_07 | Architecture style, component map, key architectural decisions |
| PROMPT_08 | Component list with responsibilities, interfaces, internal structure |
| PROMPT_09 | Layer definitions, layer responsibilities, violations |
| PROMPT_10 | Design pattern catalog with code locations, anti-patterns |
| PROMPT_11 | Data flow maps, transformation pipelines, data validation points |
| PROMPT_12 | Execution path maps for all entry points, branch conditions |
| PROMPT_13 | State machines, state stores, transition models |
| PROMPT_14 | Error catalogs, retry strategy, fallback logic, error handling patterns |
| PROMPT_15 | Concurrency model, synchronization patterns, performance characteristics |
| PROMPT_16 | System prompt inventory, prompt structure, prompt dependencies |
| PROMPT_17 | Agent inventory, agent roles, agent communication, orchestration |
| PROMPT_18 | Tool catalog, tool interfaces, invocation patterns, security |
| PROMPT_19 | Planning pipeline, reasoning steps, decision framework |
| PROMPT_20 | Memory architecture, RAG pipeline, vector stores, retrieval logic |
| PROMPT_21 | Internal API contracts, service interfaces, data format specs |
| PROMPT_22 | External service catalog, endpoints, auth methods, failure modes |
| PROMPT_23 | Event types, producers, consumers, delivery guarantees |
| PROMPT_24 | Complete configuration map, environment variable catalog |
| PROMPT_25-29 | Complete documentation set (passed to validation) |
| PROMPT_30-32 | Validation findings, gap reports, correction recommendations |
| PROMPT_33 | Final quality scores, sign-off status |
