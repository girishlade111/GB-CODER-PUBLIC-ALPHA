# FRAMEWORK DESIGN PHILOSOPHY

> The thinking behind this framework — why it is designed the way it is, what problems it solves, and the principles that guided every decision.

---

## THE PROBLEM THIS FRAMEWORK SOLVES

When an AI agent is asked to "reverse engineer this repository," several failure modes consistently occur:

### Failure Mode 1: Shallow Reading
The agent reads the README and a few top-level files, then writes a high-level summary that misses 80% of the architecture. The output looks plausible but is useless for anyone who needs actual understanding.

**Root cause:** No systematic depth requirement. The agent optimizes for quick output.

**Framework solution:** Mandatory multi-phase pipeline. Phase 1 (scan) happens before Phase 2 (structure), which happens before Phase 3 (architecture). Each phase forces deeper engagement. The agent cannot reach Phase 7 (documentation) without passing through all prior phases.

### Failure Mode 2: Invisible Blind Spots
The agent documents what it understands and silently ignores what it doesn't. The reader doesn't know what's missing.

**Root cause:** No completeness enforcement. Omissions are invisible.

**Framework solution:** Every phase requires an "Omissions" section that explicitly states what was not analyzed and why. The VALIDATION_CHECKLISTS provide quantitative coverage tracking.

### Failure Mode 3: Contradictory Claims
The system architecture document says component A owns data X, while the data flow document shows component B modifying data X directly.

**Root cause:** No cross-validation between analytical dimensions.

**Framework solution:** Phase 8 (Validation) explicitly cross-references all Phase 7 documents for consistency. PROMPT_DEPENDENCY_MAP ensures that related analyses share a common foundation.

### Failure Mode 4: Context Collapse
The agent reads 100 files, then by the time it writes documentation, it remembers only the last 10 files.

**Root cause:** AI context windows are finite; detailed analysis of large codebases exceeds them.

**Framework solution:** Summarized context handoffs between phases. Detailed findings are saved to `_analysis/` files and only pulled back when needed. Each phase refreshes the relevant context.

### Failure Mode 5: The "Everything Is a Service" Trap
The agent classifies every module as a "service" without recognizing the actual design patterns — factories, strategies, observers, state machines, etc.

**Root cause:** Insufficient design pattern recognition knowledge and no requirement to identify patterns.

**Framework solution:** PROMPT_10 is entirely dedicated to design pattern recognition. The GLOSSARY provides precise definitions. Pattern identification is a mandatory output, not optional.

### Failure Mode 6: AI Blindness
When the codebase itself contains AI prompts, agents, or AI workflows, the agent documents the "normal" code but completely misses the meta-level AI architecture.

**Root cause:** Agents rarely examine the codebase for their own kind.

**Framework solution:** Phase 5 (AI & Automation Analysis) explicitly looks for prompts, agents, tools, memory systems, and RAG pipelines. Detection happens in Phase 3 and triggers Phase 5 analysis.

---

## WHY NINE PHASES?

The nine-phase structure is not arbitrary. It follows a cognitive progression that mirrors how expert engineers understand unfamiliar codebases:

| Phase | Cognitive Step | Real-World Equivalent |
|-------|---------------|----------------------|
| 1 — Discovery | "What's in this codebase?" | Opening the project, looking at file tree |
| 2 — Structural | "How is it organized?" | Reading directory structure, understanding conventions |
| 3 — Architectural | "What are the big pieces?" | Identifying major components and their relationships |
| 4 — Deep Code | "How does each piece work?" | Reading individual files and functions |
| 5 — AI Analysis | "How does the AI work?" | Understanding meta-level AI/agent patterns |
| 6 — Integration | "How does it all fit together?" | Tracing inter-component communication |
| 7 — Documentation | "How do I explain this?" | Writing everything down for others |
| 8 — Validation | "Is my understanding correct?" | Double-checking claims against code |
| 9 — Rebuild | "Can I rebuild this?" | Verifying understanding is complete enough |

Each phase answers one question. The answer to each question is required to ask the next.

---

## WHY MODULAR PROMPTS INSTEAD OF ONE MEGA-PROMPT?

| Approach | Pros | Cons |
|----------|------|------|
| Single mega-prompt | Easy to reference once loaded | Context window exhaustion; hard to maintain; fragile; no parallelization |
| Modular prompts | Each prompt fits in context; can parallelize; easy to maintain; reusable | Requires explicit handoff management; dependency tracking needed |

The modular approach wins for these reasons:

1. **Context management** — Each prompt is ~5-15 pages. A 35-prompt framework would be 175-525 pages loaded simultaneously, exceeding any available context window.

2. **Maintainability** — Updating a single prompt is trivial. Updating a monolithic prompt file of 500+ pages is error-prone.

3. **Parallelization** — Eight parallelization opportunities mean the framework can complete faster when resources permit.

4. **Testability** — Each prompt can be tested independently. A failure in PROMPT_14 doesn't require debugging through PROMPT_01-13.

5. **Reusability** — The Technology Stack Detection prompt can be used standalone for other tasks. The monolith cannot.

---

## WHY PHASE 5 (AI ANALYSIS) IS CONDITIONAL?

Not all repositories contain AI agents, prompts, or AI workflows. Requiring AI analysis for repositories that contain only CRUD endpoints and database migrations would waste time and produce empty sections.

**Detection mechanism:** During Phase 3 (Architecture Reconstruction), the agent looks for:
- Files containing system prompts (`.md` files with AI role definitions, `.txt` files with prompt content)
- Agent orchestration patterns (`orchestrator`, `agent`, `planner`, `executor` naming)
- AI SDK usage (`llamaindex`, `langchain`, `openai`, `anthropic`, `vercel-ai-sdk`)
- Tool definitions (`tool/`, `mcp/`, `function/` patterns)
- Memory/RAG patterns (`vector store`, `embedding`, `retrieval`, `reranker`)

If any of these are found, Phase 5 is triggered. If none are found, the framework skips from Phase 4 to Phase 6 directly.

---

## WHY PHASE 9 (REBUILD PACKAGE) IS OPTIONAL?

Complete rebuild information requires exhaustive detail — exact dependency versions, build environments, configuration values, deployment infrastructure. This level of detail may not always be needed or discoverable from source code alone.

The rebuild phase is designed for:
- **Legacy systems being migrated** — where rebuilding is the primary goal
- **Documentation-driven development** — where the documentation must be buildable
- **Knowledge preservation** — where the team is being disbanded and the system must be preservable

It is optional to avoid unnecessary work when the goal is simply understanding, not rebuilding.

---

## WHY FORTY-FIVE QUALITY CHECKS?

Quality is the framework's primary differentiator from ad-hoc reverse engineering. The 45+ checks across all phases ensure:

1. **No hidden gaps** — Every aspect of quality is explicitly checked
2. **Measurable progress** — Each check is binary (pass/fail), giving clear completion criteria
3. **Reproducible quality** — Two runs of the framework should produce equivalent quality levels
4. **Improvement tracking** — Quality scores can be compared across versions of the framework

The checklists are designed to be executable by an AI agent without human intervention — each check has clear pass/fail criteria that can be verified from the documentation and source code alone.

---

## WHY TRACEABILITY IS NON-NEGOTIABLE?

The single most common failure in AI-generated documentation is the **unsupported claim** — a statement that sounds plausible but cannot be verified against the code. Traceability (requiring file:line anchors for every claim) solves this in three ways:

1. **Forces deeper analysis** — To cite a line, the agent must read it first
2. **Enables verification** — A reviewer can check any claim against the code
3. **Prevents hallucination** — It's much harder to invent code behavior when you must cite specific lines

Traceability is the framework's most important quality mechanism. No other quality standard is more important.

---

## WHY EVIDENCE-BASED AMBIGUITY REPORTING?

Code is often genuinely ambiguous — dynamic dispatch, reflection, metaprogramming, runtime code generation, implicit behavior. The framework's approach is to:

1. **Detect ambiguity** — Identify code patterns that cannot be fully analyzed statically
2. **Document it** — Explicitly state what is ambiguous and why
3. **Flag for review** — Mark ambiguous findings with `[NEEDS RUNTIME VERIFICATION]`
4. **Provide options** — Document all possible resolutions of the ambiguity

This is superior to the alternative (pretending ambiguity doesn't exist) because it turns the AI's limitation into documentation for the human reviewer about where manual investigation is needed.

---

## WHY THE FRAMEWORK VERSIONS?

Versioning the framework itself enables:
1. **Repeatability** — Running version 1.0 vs. version 2.0 should produce comparable results
2. **Improvement tracking** — Quality improvements can be measured across versions
3. **Compatibility** — Documentation consumers know which version of analysis methodology was used
4. **Accountability** — Framework defects can be traced to specific versions
5. **Migration** — As the framework evolves, old analysis can be reprocessed with new methodology

---

## LIMITATIONS AND ACKNOWLEDGMENTS

### What this framework cannot do:

1. **Execute code** — All analysis is static. Runtime behavior (race conditions, performance, memory usage) cannot be fully determined without execution.

2. **Understand intent** — The framework documents what the code does, not what the developer meant it to do (unless documented in comments or commit messages).

3. **Reverse compiled/binary code** — This framework is designed for source code. Binary reverse engineering requires different techniques.

4. **Guarantee human-level insight** — The framework maximizes the quality of AI-driven analysis, but an expert human engineer will still catch nuances that the framework may miss.

### Design tradeoffs:

1. **Depth vs. speed** — The framework optimizes for depth, not speed. For quick overviews, use only Phase 1–3.

2. **Structure vs. flexibility** — Strict structure ensures quality but may feel rigid for small or unusual codebases.

3. **Completeness vs. practicality** — 100% completeness is the target but may be practically unreachable for very large repositories (5000+ files). The framework degrades gracefully by documenting what was omitted and why.
