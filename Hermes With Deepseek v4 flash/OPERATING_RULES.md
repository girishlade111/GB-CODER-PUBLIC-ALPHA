# OPERATING RULES

> These rules are binding on any AI agent using this framework. Violation of any rule constitutes framework misuse and invalidates the analysis.

---

## RULE 1: SEQUENTIAL DISCIPLINE

**1.1** Prompts must be executed in the numbered order unless the PROMPT_DEPENDENCY_MAP explicitly lists exceptions.

**1.2** A prompt may NOT be skipped unless its output is explicitly not needed for the downstream analysis goal.

**1.3** If a prompt is skipped, all downstream prompts that depend on it must be marked as having a dependency gap.

**1.4** Parallel execution is only permitted at explicitly marked join points in the PROMPT_DEPENDENCY_MAP.

---

## RULE 2: EVIDENCE-BASED ANALYSIS

**2.1** Every claim about code behavior MUST cite:
   - The exact file path (relative to repository root)
   - The line number or line range
   - A direct quote or paraphrase of the relevant code (with context)

**2.2** If code behavior is ambiguous (e.g., dynamic dispatch, runtime polymorphism, reflection), the agent MUST:
   - Document all possible resolutions
   - State which cannot be determined statically
   - Flag dynamic behavior for manual review

**2.3** Speculative claims must be prefixed with `[SPECULATIVE]` and include the reasoning chain that led to the speculation.

**2.4** "Dead code" must be verified by tracing callers, not assumed by name or comments.

---

## RULE 3: COMPLETENESS REQUIREMENT

**3.1** A phase is complete only when every file in scope has been analyzed.

**3.2** "In scope" means:
   - Phase 1–3: All files in the repository
   - Phase 4–6: All files identified as architecturally significant in Phase 3
   - Phase 7–8: All files documented in Phase 3–6

**3.3** Files excluded from analysis (e.g., generated code, third-party dependencies, build artifacts) must be explicitly listed with the reason for exclusion.

**3.4** Generated code must be tagged as `[GENERATED]` and its generator identified if possible.

---

## RULE 4: DOCUMENTATION INTEGRITY

**4.1** All output documentation must follow the structure requirements in OUTPUT_RULES.md.

**4.2** All diagrams must use Mermaid syntax unless another format is explicitly specified.

**4.3** Every section header must be consistent with the phase numbering scheme.

**4.4** Cross-references must use the format `[Phase N: Prompt Name](link)` for navigability.

**4.5** All file paths in documentation must be relative to the repository root.

---

## RULE 5: TRANSPARENCY

**5.1** The agent MUST log every file it examines with timestamp and result.

**5.2** The agent MUST log every dependency decision (why one interpretation was chosen over another).

**5.3** The agent MUST log every ambiguity it encounters and how it resolved or deferred it.

**5.4** The agent MUST NOT silently correct assumed errors in the source code. Document the mismatch between intended and actual behavior.

---

## RULE 6: NO CODE MODIFICATION

**6.1** The agent MUST NOT modify the repository being analyzed.

**6.2** The agent MUST NOT generate code that modifies the repository.

**6.3** The agent MUST NOT generate patches, refactoring suggestions, or code replacements within the analysis documentation (these belong in a separate recommendations document if requested).

**6.4** The agent MAY generate example code in documentation for illustrative purposes, but MUST clearly label it as `[EXAMPLE]`.

---

## RULE 7: SCALE ADAPTATION

**7.1** For repositories under 50 files, the agent should read every file completely.

**7.2** For repositories between 50–500 files, the agent should read every architecturally significant file and sample representative utility files.

**7.3** For repositories over 500 files, the agent should:
   - Categorize files by role (architectural, utility, generated, test, config)
   - Read 100% of architectural files
   - Read representative samples from each category
   - Explicitly document what was not read and why

**7.4** The agent MUST adjust depth based on file complexity — a 5-line config file needs less analysis than a 500-line state machine.

---

## RULE 8: DEPENDENCY HANDLING

**8.1** External dependencies must be cataloged separately from internal dependencies.

**8.2** For each external dependency, document:
   - Package name and version (from lock file or package manifest)
   - Purpose in the system
   - How it's used (import locations)
   - Whether it's pinned or floating
   - License (if visible)

**8.3** For each internal dependency, document:
   - Direction of dependency (module A depends on module B)
   - Type of dependency (import, composition, interface, event, data)
   - Stability (is this a stable or volatile dependency?)
   - Whether it creates a circular dependency

---

## RULE 9: ERROR HANDLING IN ANALYSIS

**9.1** If a file cannot be read (encoding, permission, corruption), document the file path and the error — do not skip silently.

**9.2** If a dependency cannot be resolved, document the unresolved reference and continue.

**9.3** If the repository has missing files, broken imports, or syntax errors, document these as repository defects and analyze the intent as best as possible.

**9.4** If the analysis produces contradictory evidence (e.g., code behavior that appears to violate its documented intent), document BOTH the code behavior and the documented intent, and flag the contradiction.

---

## RULE 10: OUTPUT HYGIENE

**10.1** Every output file must start with a metadata header:
   ```
   # Document Title
   
   > **Source:** PROMPT_NN_Name.md  
   > **Phase:** N  
   > **Repository:** <name>  
   > **Date:** <date>  
   > **Status:** [Draft | Review | Complete]
   ```

**10.2** Every output file must end with a completion statement and a "next steps" section pointing to the next expected prompt.

**10.3** No output file should contain the raw prompt instructions — documentation is for readers, not the agent.

**10.4** Temporary analysis notes, intermediate reasoning, and agent-internal state must be saved to an `_analysis/` directory, not mixed with final documentation.

---

## RULE 11: REPRODUCIBILITY

**11.1** Analysis must be reproducible. Two independent runs of this framework on the same repository version must produce equivalent results.

**11.2** If the framework uses non-deterministic analysis methods (e.g., LLM-based pattern recognition), document the non-deterministic steps and their confidence level.

**11.3** All analysis must be timestamped. All artifacts must reference the repository commit hash they were generated from.

---

## RULE 12: BOUNDARIES

**12.1** The analysis boundary is the repository root. Files outside this boundary (system libraries, sibling repositories, deployment infrastructure) are documented only as external dependencies.

**12.2** Generated/build output directories (`node_modules/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `.venv/`, etc.) are excluded from analysis unless they contain non-generated content.

**12.3** Git history may be consulted for understanding intent, but each finding from history must be explicitly labeled `[FROM HISTORY]`.
