# Enterprise Reverse Engineering Prompt Framework — MASTER INDEX

> **Version:** 1.0  
> **Classification:** Enterprise-Grade Prompt Architecture  
> **Status:** COMPLETE  
> **Total Prompt Files:** 36  
> **Infrastructure Files:** 12  
> **Total Phases:** 9  
> **Purpose:** Modular, extensible, reusable framework for AI-powered reverse engineering of any software repository  
> **Scope:** From single-file utilities to multi-service distributed systems with AI/agent workflows

---

## FRAMEWORK OVERVIEW

This framework is a **modular prompt project** — a collection of interconnected, versioned, and dependency-tracked prompt files that together form a complete reverse engineering system. Each prompt file is a standalone unit that can be reused across different repositories. Combined, they form a pipeline that guides an AI agent from first encounter to complete documentation of any software system.

The framework follows a strict sequential pipeline (**discovery → structural → architecture → deep code → AI analysis → integration → documentation**), with built-in quality gates at every phase and conditional branches for AI-specific systems.

---

## FRAMEWORK ARCHITECTURE

```
enterprise-re-prompt-framework/
│
├── MASTER_INDEX.md                 ◄── YOU ARE HERE — Framework map and navigation
├── MASTER_PROMPT.md                ◄── The orchestrator — loads and sequences sub-prompts
├── PROJECT_SPECIFICATION.md        ◄── What this framework is and how it works
├── PROMPT_DESIGN_GUIDE.md          ◄── Design decisions, tradeoffs, extensibility
│
├── MISSION.md                      ◄── Core mission and philosophy
├── OPERATING_RULES.md              ◄── 8 rules every AI agent must follow
├── QUALITY_STANDARDS.md            ◄── Quality gates (Q1-Q8) for every deliverable
├── OUTPUT_RULES.md                 ◄── Rules for generated documentation format
│
├── FRAMEWORK_DESIGN_PHILOSOPHY.md  ◄── Design thinking behind the framework
├── PROMPT_DEPENDENCY_MAP.md        ◄── Directed dependency graph between all prompts
├── GLOSSARY.md                     ◄── Standardized terminology (30+ terms)
├── DIAGRAM_TEMPLATES.md            ◄── Reusable Mermaid diagram templates
├── VALIDATION_CHECKLISTS.md        ◄── Phase-level quality checklists
│
├── Phase 1 — DISCOVERY/
│   ├── PROMPT_01_Repository_Scan.md
│   ├── PROMPT_02_File_Inventory.md
│   └── PROMPT_03_Technology_Stack_Detection.md
│
├── Phase 2 — STRUCTURAL ANALYSIS/
│   ├── PROMPT_04_Folder_Architecture.md
│   ├── PROMPT_05_Module_Dependency_Graph.md
│   └── PROMPT_06_Entry_Point_Analysis.md
│
├── Phase 3 — ARCHITECTURE RECONSTRUCTION/
│   ├── PROMPT_07_System_Architecture_Reconstruction.md
│   ├── PROMPT_08_Component_Decomposition.md
│   ├── PROMPT_09_Layer_Analysis.md
│   └── PROMPT_10_Design_Pattern_Recognition.md
│
├── Phase 4 — DEEP CODE ANALYSIS/
│   ├── PROMPT_11_Data_Flow_Analysis.md
│   ├── PROMPT_12_Execution_Path_Reconstruction.md
│   ├── PROMPT_13_State_Management_Analysis.md
│   ├── PROMPT_14_Error_Handling_Retry_Strategy.md
│   └── PROMPT_15_Concurrency_Performance_Analysis.md
│
├── Phase 5 — AI & AUTOMATION ANALYSIS/        ◄── CONDITIONAL: Execute only if AI patterns detected
│   ├── PROMPT_16_Prompt_Architecture_Analysis.md
│   ├── PROMPT_17_Agent_Workflow_Reconstruction.md
│   ├── PROMPT_18_Tool_Integration_Analysis.md
│   ├── PROMPT_19_Planning_Reasoning_Pipeline.md
│   └── PROMPT_20_Memory_RAG_Workflow_Analysis.md
│
├── Phase 6 — INTEGRATION & BOUNDARY ANALYSIS/
│   ├── PROMPT_21_Internal_API_Contract_Analysis.md
│   ├── PROMPT_22_External_Service_Integration.md
│   ├── PROMPT_23_Event_Stream_Workflow_Analysis.md
│   └── PROMPT_24_Configuration_Environment_Analysis.md
│
├── Phase 7 — DOCUMENTATION GENERATION/
│   ├── PROMPT_25_Architecture_Handbook_Generation.md
│   ├── PROMPT_26_Developer_Handbook_Generation.md
│   ├── PROMPT_27_Rebuild_Guide_Generation.md
│   ├── PROMPT_28_API_Reference_Class_Catalog.md
│   ├── PROMPT_29_Engineering_Notes_Cross_References.md
│   └── PROMPT_30_Validation_Handover_Protocol.md
│
├── Phase 8 — VALIDATION AND QUALITY/
│   ├── PROMPT_31_Cross_Phase_Accuracy_Validation.md
│   ├── PROMPT_32_Completeness_Deep_Audit.md
│   ├── PROMPT_33_Consistency_Contradiction_Verification.md
│   └── PROMPT_34_Final_Quality_Gate_Signoff.md
│
└── Phase 9 — REBUILD PACKAGE/
    ├── PROMPT_35_Rebuild_Package_Assembly.md
    └── PROMPT_36_Rebuild_Verification_Protocol.md
```

---

## PHASE DEPENDENCY MAP

```
Phase 1 (Discovery)
    │
    ▼
Phase 2 (Structural Analysis)
    │
    ▼
Phase 3 (Architecture Reconstruction)
    │
    ├────────────────────────────────┐
    ▼                                ▼
Phase 4 (Deep Code Analysis)    Phase 5 (AI Analysis — CONDITIONAL)
    │                                │
    └───────────────────┬────────────┘
                        ▼
              Phase 6 (Integration & Boundaries)
                        │
                        ▼
              Phase 7 (Documentation Generation)
                        │
                        ▼
              Phase 8 (Validation & Quality)
                        │
                        ▼
              Phase 9 (Rebuild Package — OPTIONAL)
```

**Rules:**
- Phase 5 is **optional** — execute only if AI/agent patterns were detected in Phase 3
- Phase 4 and Phase 5 can execute in parallel (different concerns)
- All phases must complete before Phase 7 (Documentation)
- Phase 8 runs only AFTER Phase 7 outputs are finalized
- Phase 9 is **optional** — only if a rebuild package is requested
- Never skip Phase 1 or Phase 2 — they establish the foundation

---

## PROMPT DEPENDENCY DETAIL

| Prompt | Depends On | Provides For |
|--------|-----------|-------------|
| P01 | — | P02, P03 |
| P02 | P01 | P03, P04 |
| P03 | P01, P02 | P04, P05, P07 |
| P04 | P02, P03 | P05, P06, P07 |
| P05 | P04 | P09, P22 |
| P06 | P04 | P12, P13 |
| P07 | P04, P05 | P08, P09, P10 |
| P08 | P07 | P09, P10, P11 |
| P09 | P07, P08 | P11, P25 |
| P10 | P07, P08 | P15, P26 |
| P11 | P08, P09 | P12, P13, P14, P21 |
| P12 | P11 | P13, P14, P15 |
| P13 | P11, P12 | P14, P15 |
| P14 | P11, P12, P13 | P15, P22 |
| P15 | P14, P13, P12 | P21, P24 |
| P16 | P10 | P17, P18 |
| P17 | P16 | P18, P19 |
| P18 | P16, P17 | P19, P20, P22 |
| P19 | P18 | P20 |
| P20 | P18 | P24 |
| P21 | P11, P15 | P22, P23, P24, P28 |
| P22 | P21 | P23, P24, P25 |
| P23 | P21 | P24, P28 |
| P24 | P21, P22, P23 | P25, P27 |
| P25 | P09, P22 | P26, P27 |
| P26 | P25 | P27 |
| P27 | P26 | P29 |
| P28 | P21 | P29 |
| P29 | P25-P28 | P30 |
| P30 | All | Phase 8 validation |
| P31 | ALL Phase 1-7 outputs | P32 |
| P32 | P31 | P33 |
| P33 | P31, P32 | P34 |
| P34 | P31, P32, P33 | Phase 9 (if needed) |
| P35 | P34, ALL Phase 1-7 | P36 |
| P36 | P35 | (Project complete) |

---

## QUICK-START GUIDE

### For a new repository — full pipeline:

1. **Read `MISSION.md`** — understand the philosophy and approach
2. **Read `OPERATING_RULES.md`** — internalize the 8 rules
3. **Read `QUALITY_STANDARDS.md`** — know the quality bar (Q1-Q8)
4. **Start with `PROMPT_01_Repository_Scan.md`** — proceed sequentially through phases
5. **After each prompt, validate** — each prompt has built-in quality gates
6. **Check `PROMPT_DEPENDENCY_MAP.md`** before skipping any prompt
7. **Run Phase 5 only if AI patterns found** — otherwise skip to Phase 6

### For a specific component analysis:

1. Run Phase 1 to establish context
2. Run Phase 2 for structural understanding
3. Jump to the Phase 3 prompt you need
4. Verify dependencies using `PROMPT_DEPENDENCY_MAP.md`

### For AI-specific analysis:

1. Run Phases 1-3 to establish full system context
2. Execute Phase 5 (all 5 prompts) for complete AI system reverse engineering
3. Proceed to Phases 6-7 for integration and documentation

---

## FILE NAMING CONVENTION

| Pattern | Example | Purpose |
|---------|---------|---------|
| `PROMPT_NN_Name.md` | `PROMPT_07_System_Architecture.md` | Executable prompt files (30 total) |
| `MASTER_*.md` | `MASTER_PROMPT.md` | Orchestration and navigation |
| `*_RULES.md` | `OPERATING_RULES.md` | Rule/constraint files |
| `*_STANDARDS.md` | `QUALITY_STANDARDS.md` | Quality definition files |
| `*_GUIDE.md` | `PROMPT_DESIGN_GUIDE.md` | Explanatory documentation |
| `*_TEMPLATES.md` | `DIAGRAM_TEMPLATES.md` | Reusable templates |

---

## OUTPUT ARTIFACTS

| Artifact | Produced By | Format |
|----------|-------------|--------|
| Repository scan report | PROMPT_01 | Markdown summary |
| File inventory | PROMPT_02 | Annotated table |
| Technology stack report | PROMPT_03 | Structured markdown |
| Folder architecture map | PROMPT_04 | Mermaid + descriptions |
| Module dependency graph | PROMPT_05 | Mermaid graph |
| Entry point catalog | PROMPT_06 | Markdown + call graph |
| System architecture | PROMPT_07 | C4 model decomposition |
| Component decomposition | PROMPT_08 | Component tree |
| Layer analysis | PROMPT_09 | Layer diagram + violations |
| Design pattern catalog | PROMPT_10 | Pattern instances + code |
| Data flow diagrams | PROMPT_11 | Mermaid sequence diagrams |
| Execution path maps | PROMPT_12 | Flowcharts + decision trees |
| State machine models | PROMPT_13 | State diagrams |
| Error handling catalog | PROMPT_14 | Propagation maps |
| Concurrency analysis | PROMPT_15 | Synchronization + caching |
| Prompt inventory | PROMPT_16 | Annotated prompt catalog |
| Agent workflow maps | PROMPT_17 | Communication diagrams |
| Tool integration map | PROMPT_18 | Interface contracts |
| Planning pipeline | PROMPT_19 | Decision framework |
| Memory/RAG workflow | PROMPT_20 | Retrieval pipeline |
| API contract docs | PROMPT_21 | Interface specifications |
| External service catalog | PROMPT_22 | Integration + failover |
| Event workflow maps | PROMPT_23 | Event flow topologies |
| Configuration catalog | PROMPT_24 | Environment + config map |
| Architecture Handbook | PROMPT_25 | C4 model document |
| Developer Handbook | PROMPT_26 | Practical reference guide |
| Rebuild Guide | PROMPT_27 | Step-by-step reconstruction |
| API Reference | PROMPT_28 | Endpoint + class catalog |
| Engineering Notes | PROMPT_29 | Debt + cross-references + ADRs |
| Validation Report | PROMPT_30 | Completeness + handover |

---

## CROSS-REFERENCE INDEX

| Concept | Defined In | Used By |
|---------|-----------|---------|
| Core mission | `MISSION.md` | All prompts |
| Operating rules | `OPERATING_RULES.md` | All prompts |
| Quality standards | `QUALITY_STANDARDS.md` | All quality gates |
| Output formatting | `OUTPUT_RULES.md` | Especially Phase 7 |
| Standardized terminology | `GLOSSARY.md` | All prompts |
| Design philosophy | `FRAMEWORK_DESIGN_PHILOSOPHY.md` | Framework understanding |
| Diagram templates | `DIAGRAM_TEMPLATES.md` | Phase 3, 4, 7 |
| Validation checklists | `VALIDATION_CHECKLISTS.md` | All phase gates |
| Prompt dependency map | `PROMPT_DEPENDENCY_MAP.md` | Framework navigation |

---

## FRAMEWORK METADATA

| Metric | Value |
|--------|-------|
| Total prompt files | 36 |
| Infrastructure files | 12 |
| Total project files | 48 |
| Total phases | 9 |
| Parallelization opportunities | 2 (Phase 4 + Phase 5) |
| Minimum repository size | 1 file |
| Maximum repository size | Unlimited (modular scope) |
| AI agent experience level | Intermediate to Expert |
| Required AI capabilities | Code reading, pattern recognition, diagram generation, structured writing |

---

## FRAMEWORK COMPLETENESS

This framework v1.0 is **complete and ready for use.** All 36 prompts across 9 phases are written, validated, and cross-referenced. The framework covers:

- ✅ **Discovery** — 3 prompts for initial repository scanning and inventory
- ✅ **Structural Analysis** — 3 prompts for folder/entry/dependency mapping
- ✅ **Architecture Reconstruction** — 4 prompts for system architecture, components, layers, patterns
- ✅ **Deep Code Analysis** — 5 prompts for data flow, execution paths, state, errors, concurrency
- ✅ **AI & Automation Analysis** — 5 conditional prompts for prompts, agents, tools, planning, memory
- ✅ **Integration & Boundary Analysis** — 4 prompts for APIs, external services, events, configuration
- ✅ **Documentation Generation** — 6 prompts for handbooks, references, rebuild guide, validation
- ✅ **Validation & Quality** — 4 prompts for accuracy, completeness, consistency, and sign-off
- ✅ **Rebuild Package** — 2 prompts for rebuild artifact assembly and verification

**Total reverse engineering capability:** 36 executable prompts producing 36+ documentation artifacts, organized in a strict sequential pipeline with optional conditional branches.

**Next steps for extension:** Add more specialization prompts for database-only analysis, mobile-specific analysis, embedded systems analysis, or CI/CD pipeline analysis.
