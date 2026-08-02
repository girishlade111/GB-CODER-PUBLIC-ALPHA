# Prompt 31: Cross-Phase Accuracy Validation

> **Phase:** 8 — Validation and Quality  
> **Dependencies:** ALL Phase 1-7 outputs (P01-P30)  
> **Input Required:** Every analysis file and documentation file generated across all seven phases  
> **Output Produced:** Cross-phase accuracy validation report with discrepancy detection and correction mapping  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the Accuracy Validation Officer. Your mission is to perform a cross-phase accuracy validation of the ENTIRE reverse engineering output. You will compare findings from different phases against each other, against the original source code, and identify every discrepancy, contradiction, or inaccuracy.

This is the most important quality step. Inaccurate documentation is worse than no documentation.

---

## 2. PREREQUISITES

- [ ] PROMPT_30 completed — validation and handover protocol executed
- [ ] ALL Phase 1-7 output files accessible
- [ ] Original source code still accessible (for spot-check verification)

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Cross-Phase Claim Verification**

For EVERY major claim made across phases, verify it's consistent:

| Claim Type | Example | Phases to Cross-Reference |
|------------|---------|--------------------------|
| File count | "145 files in the repository" | P02 (file inventory) vs P01 (scan) |
| Tech stack | "Uses React 18 with TypeScript" | P03 (tech stack) vs P04 (folder arch) vs P07 (system arch) |
| Component names | "AuthService handles authentication" | P07 (system arch) vs P08 (component decomp) vs P21 (API contracts) |
| Data flow | "User data flows Controller → Service → Repository" | P11 (data flow) vs P12 (exec paths) vs P21 (API contracts) |
| Error types | "DuplicateEmailError at user.service.ts:63" | P14 (error handling) vs P12 (exec paths) vs P21 (API contracts) |
| Layer boundaries | "Presentation → Application → Domain → Infrastructure" | P09 (layers) vs P04 (folder arch) vs P07 (system arch) |
| External dependencies | "Stripe API for payments" | P22 (external) vs P21 (API contracts) vs P24 (config) |
| Event schemas | "user.created event has userId, email fields" | P23 (events) vs P11 (data flow) vs P21 (API contracts) |
| Configuration keys | "DATABASE_URL env var" | P24 (config) vs P22 (external) vs P26 (dev handbook) |
| Line numbers | "Error at auth.ts:44" | Spot-check against actual source code |

**Step 2: Spot-Check Against Source Code**

Select 20-30 claims from the documentation that reference specific code locations and verify each against the actual source:

```
## Spot Check Verification

### Check 1: Claim from P10 (Design Patterns)
Claim: "Repository pattern at src/repositories/UserRepository.ts implements interface IRepository"
Source: src/repositories/UserRepository.ts:1-50
Result: [PASS | FAIL]
Note: Implementation matches documentation exactly.

### Check 2: Claim from P14 (Error Handling)
Claim: "DuplicateEmailError thrown at user.service.ts:63"
Source: user.service.ts:60-65
Result: [PASS | FAIL]
Note: Line 63 is actually `const existing = await this.userRepo.findByEmail(email)` — the error is thrown at line 65.
```

**Step 3: Identify Contradictions**

Find statements that contradict each other:

| Doc A | Doc B | Contradiction | Severity | Resolution |
|-------|-------|---------------|----------|------------|
| P07: "4-layer architecture" | P04: "3 main directories" | P07 claims 4 layers but P04 shows 3 top-level dirs | MEDIUM | P07 layers might span across subdirectories |
| P03: "Uses PostgreSQL 15" | P24: "DATABASE_URL points to MySQL" | CRITICAL | Check actual schema or migration files |

Severity levels:
- **CRITICAL:** Wrong technology, wrong architecture pattern, wrong data model
- **HIGH:** Incorrect component responsibility, missing major dependency, wrong file line numbers
- **MEDIUM:** Terminology inconsistency, count mismatch, minor location error
- **LOW:** Formatting issue, non-standard diagram, typo

**Step 4: Generate Correction Map**

For every discrepancy found, create a correction entry:

```
## Correction C001

### Discrepancy
P07 claims "4-layer architecture: Presentation, Application, Domain, Infrastructure"
P04 shows "3 main directories: src/api, src/services, src/db"

### Root Cause
P07 identified layers logically (based on code analysis); P04 identified directories physically.
Result: Not a true contradiction — logical layers exist within src/services directory.

### Resolution
Update P04 to note: "The 3 physical directories map to 4 logical layers: 
- src/api = Presentation layer
- src/services = Application + Domain layers (mixed)
- src/db = Infrastructure layer"

### Affected Files
- P04_Folder_Architecture.md: Section 3 — add logical layer mapping
- P07_System_Architecture.md: Section 2 — clarify that Application and Domain share one directory

### Priority
MEDIUM — adds clarity, does not change understanding
```

---

## 4. EXECUTION INSTRUCTIONS

1. **Start with the most critical claims** — technology choices, architecture patterns, data models. These affect everything downstream.

2. **Be systematic.** Don't pick random claims. Use this verification matrix:

```
Compare every pair:
P01 ↔ P02 ↔ P03 ↔ P04 ↔ P05 ↔ P06
         ↓         ↓         ↓
    P07 ↔ P08 ↔ P09 ↔ P10
         ↓
    P11 ↔ P12 ↔ P13 ↔ P14 ↔ P15
         ↓
    P16 ↔ P17 ↔ P18 ↔ P19 ↔ P20
         ↓
    P21 ↔ P22 ↔ P23 ↔ P24
         ↓
    P25 ↔ P26 ↔ P27 ↔ P28 ↔ P29 ↔ P30
```

3. **Actually read the source code** for verification. Don't just check docs against other docs.

4. **Document CORRECTIONS to source files** — don't just flag errors, specify what needs to change and in which file.

---

## 5. OUTPUT SPECIFICATION

Generate `31_accuracy_validation.md`:

### 5.1 Validation Summary

| Metric | Value |
|--------|-------|
| Total claims verified | [X] |
| Claims passed | [X] |
| Claims failed | [X] |
| Contradictions found | [X] |
| Corrections required | [X] |
| CRITICAL corrections | [X] |
| HIGH corrections | [X] |
| Accuracy score | [X]% |

### 5.2 Spot-Check Results

[Table of 20-30 spot checks with PASS/FAIL]

### 5.3 Contradiction Catalog

[All contradictions found, organized by severity]

### 5.4 Correction Map

[Numbered corrections with root cause, resolution, affected files, and priority]

### 5.5 Overall Accuracy Assessment

[Summary assessment — is the documentation trustworthy? What are the weak areas?]

---

## 6. QUALITY GATE

- [ ] Cross-phase claims verified (major claims from every phase)
- [ ] 20+ spot checks against actual source code
- [ ] All contradictions identified
- [ ] Correction map with file-level instructions
- [ ] Accuracy score calculated
- [ ] Critical/high corrections prioritized

---

## 7. HANDOFF

Pass corrections to the phase prompts that need updates. Then proceed to P32 (Completeness Deep Audit).
