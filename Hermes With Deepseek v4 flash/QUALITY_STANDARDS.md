# QUALITY STANDARDS

> These standards define the quality bar for all outputs produced by this framework. Every artifact must pass these gates before being considered complete.

---

## Q1: TECHNICAL ACCURACY

**Q1.1** All claims about code behavior must be factually correct. An inaccuracy in documentation is worse than no documentation — it creates false certainty.

**Q1.2** For every function documented, the agent MUST verify:
   - Parameter names and types match the actual function signature
   - Return type matches the actual return type
   - Side effects are accurately described
   - Error conditions match the actual error handling code

**Q1.3** For every data flow documented, the agent MUST verify:
   - The source produces what the documentation claims
   - The transformation is factually correct
   - The sink receives what the data flow claims

**Q1.4** For every state machine documented, the agent MUST verify:
   - All states are accounted for
   - All transitions are real (not invented)
   - Guard conditions are accurately captured
   - Initial and terminal states are correct

**Q1.5** Accuracy is measured by: **zero false claims per artifact.** A "false claim" is any statement that contradicts the actual source code.

---

## Q2: COMPLETENESS

**Q2.1** Scope completion: Every file in the analysis scope must appear in at least one documentation artifact.

**Q2.2** Depth completion: Every function in architecturally significant files must have documented purpose, parameters, return value, and side effects.

**Q2.3** Path completion: Every execution path from every entry point must be traced to every terminal state.

**Q2.4** Edge case completion: Error handling branches, empty-state branches, boundary condition branches must be documented (not just the "happy path").

**Q2.5** Configuration coverage: Every configuration point must be documented with:
   - Name and location
   - All possible values
   - Default value (if any)
   - Effect on system behavior
   - Interactions with other configuration points

**Q2.6** Completeness is measured by: **coverage ratio** — (documented items) / (total items in scope) × 100%. Target: ≥ 95% for all categories.

---

## Q3: TRACEABILITY

**Q3.1** Every claim must include a source anchor: file path + line number(s). This is non-negotiable.

**Q3.2** Every diagram must have a corresponding code reference — the implementation that the diagram represents must be locatable.

**Q3.3** Every design pattern identification must include:
   - The pattern name and variant
   - The exact files and classes/functions implementing it
   - How the implementation deviates from the canonical pattern (if at all)

**Q3.4** Every external dependency must be traceable to:
   - The package manifest that declares it
   - The files that import/require it
   - The specific features/APIs used

**Q3.5** Traceability is measured by: **anchor density** — anchors per 100 words of documentation. Target: ≥ 2 anchors per major claim category.

---

## Q4: STRUCTURAL QUALITY

**Q4.1** All documentation must follow a consistent outline structure within each document type.

**Q4.2** Nesting must not exceed 5 levels deep (h1 → h2 → h3 → h4 → h5).

**Q4.3** Every section must have at least one paragraph of content — no empty headers.

**Q4.4** Tables must have headers, consistent column alignment, and no merged cells (plain markdown).

**Q4.5** Lists must be homogeneous — all items in a list must be of the same type (all sentences, all fragments, all single terms).

**Q4.6** Code blocks must specify the language for syntax highlighting: ` ```python `, ` ```typescript `, ` ```json `, etc.

---

## Q5: DIAGRAM QUALITY

**Q5.1** Every diagram must be syntactically valid Mermaid (or specified format). Validated before delivery.

**Q5.2** Every diagram must have a caption explaining what it represents and what the viewer should observe.

**Q5.3** Component/class diagrams must distinguish between:
   - Internal components (implemented in this repo)
   - External components (third-party, sibling services)
   - Data stores (databases, caches, filesystems)

**Q5.4** Sequence diagrams must include:
   - All participating actors/components
   - Message types (sync call, async event, callback, return)
   - Timing information where relevant

**Q5.5** State diagrams must include:
   - All possible states
   - All legal transitions
   - Transition triggers (events, conditions, timeouts)
   - Entry and exit actions per state
   - Initial and final states

**Q5.6** Flowcharts must include:
   - Decision diamonds with labeled branches
   - Process boxes with action descriptions
   - Terminator nodes for start and end
   - Loop markers where applicable

---

## Q6: CONSISTENCY

**Q6.1** Terminology must be consistent across all artifacts. If a module is called "AuthService" in one place, it must not be called "authenticationService" or "auth_service" elsewhere.

**Q6.2** Naming conventions from the source code must be preserved in documentation, not normalized.

**Q6.3** File path references must use consistent casing (prefer the actual filesystem casing).

**Q6.4** Diagram styles (colors, shapes, line types) must be consistent within each diagram type across all artifacts.

**Q6.5** All dates and timestamps must use ISO 8601 format: `YYYY-MM-DD HH:MM:SS UTC`.

---

## Q7: CLARITY

**Q7.1** Avoid ambiguous language: "might", "could", "possibly", "seems to", "appears to" — if the evidence is uncertain, use `[SPECULATIVE]` explicitly.

**Q7.2** Define acronyms on first use per document (not globally — each document is standalone).

**Q7.3** Use active voice: "The service reads the configuration from the database" not "The configuration is read from the database by the service."

**Q7.4** Keep paragraphs to 3–7 sentences. Break longer concepts into subsections.

**Q7.5** Each section should answer one question. The section title should state the question or topic.

---

## Q8: VERIFIABILITY

**Q8.1** Every artifact must be independently verifiable by a second agent or human reviewer.

**Q8.2** Verification must not require running the code — all claims must be evident from the source code and analysis.

**Q8.3** For claims that cannot be verified statically (e.g., runtime behavior, async race conditions), mark them as `[NEEDS RUNTIME VERIFICATION]`.

**Q8.4** Each artifact must include a "Verification" section that tells the reader how to verify the information presented.

---

## Q9: QUALITY GATES

Each phase has a mandatory quality gate before proceeding to the next:

| Phase | Quality Gate | Method |
|-------|-------------|--------|
| 1 — Discovery | Inventory completeness check | Compare file count vs. actual listing |
| 2 — Structural | Dependency resolution check | Trace every import to a recognized module |
| 3 — Architecture | Architecture-coherence check | Verify layer rules are not violated |
| 4 — Deep Code | Implementation-fidelity check | Spot-check 10% of claims against code |
| 5 — AI Analysis | Prompt-execution trace check | Verify every prompt has a handler |
| 6 — Integration | Boundary-completeness check | All external calls have documented counterparts |
| 7 — Documentation | Format-compliance check | Validate against OUTPUT_RULES.md |
| 8 — Validation | Full-quality-score check | All Q1–Q8 standards met above threshold |
| 9 — Rebuild | Rebuild-verification check | Build succeeds from documentation alone |

---

## Q10: CONTINUOUS IMPROVEMENT

**Q10.1** After completing each phase, record lessons learned:
   - What was harder than expected?
   - What information was missing from the code?
   - What patterns were difficult to analyze?
   - What improvements would help the next analysis?

**Q10.2** Update the framework with new patterns discovered during analysis.

**Q10.3** Flag any code patterns that the framework does not adequately handle.
