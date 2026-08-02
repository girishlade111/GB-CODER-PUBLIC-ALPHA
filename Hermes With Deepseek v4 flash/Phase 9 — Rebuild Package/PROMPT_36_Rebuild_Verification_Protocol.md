# Prompt 36: Rebuild Package Verification Protocol

> **Phase:** 9 — Rebuild Package  
> **Dependencies:** P35 (Rebuild Package Assembly)  
> **Input Required:** Complete rebuild package (Artifacts A-I)  
> **Output Produced:** Rebuild verification report, completeness assessment, and certification of rebuild-readiness  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the Rebuild Verifier. Your mission is to verify that the rebuild package is complete, accurate, and actionable. The verification ensures that a competent team can rebuild the system using ONLY the rebuild package, without accessing the original source code.

---

## 2. PREREQUISITES

- [ ] P35 completed — rebuild package assembled
- [ ] Rebuild package directory populated (01_SYSTEM_SPECIFICATION.md through 09_DEPLOYMENT_ARCHITECTURE.md)
- [ ] Original source code accessible (for verification only)

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Completeness Verification**

Verify every artifact in the rebuild package exists and is complete:

| Artifact File | Required Sections | Complete? | Missing Sections |
|---------------|------------------|-----------|------------------|
| 01_SYSTEM_SPECIFICATION.md | Purpose, Tech Stack, Architecture, Decisions, Constraints | [YES/NO] | — |
| 02_BUILD_AND_RUN.md | Prerequisites, Setup Steps, Verification | [YES/NO] | — |
| 03_DATA_MODEL.md | ER Diagram, Schema Definitions, Migrations | [YES/NO] | — |
| 04_ENVIRONMENT_CONFIG.md | All env vars with descriptions and defaults | [YES/NO] | — |
| 05_API_REFERENCE.md | Every endpoint with method, path, request, response | [YES/NO] | — |
| 06_IMPLEMENTATION_GUIDE.md | Phased build sequence | [YES/NO] | — |
| 07_KEY_ALGORITHMS.md | Top 5-10 algorithms with pseudocode | [YES/NO] | — |
| 08_TESTING_STRATEGY.md | Unit, integration, e2e test plans | [YES/NO] | — |
| 09_DEPLOYMENT_ARCHITECTURE.md | Infra diagram, containers, CI/CD, monitoring | [YES/NO] | — |

**Step 2: Accuracy Verification**

For each artifact, verify accuracy by cross-referencing with the original analysis:

| Check | Method |
|-------|--------|
| Is the tech stack correct? | Compare against P03 and original package.json/requirements.txt |
| Are the API contracts accurate? | Compare against P21 and original controller files |
| Is the data model correct? | Compare against P13 state model and original schema files |
| Are env vars correct? | Compare against P24 and original .env.example |
| Are build steps correct? | Verify against original README and CI config |
| Are architecture diagrams accurate? | Compare against P07, P09 |

**Step 3: Actionability Verification**

For build & run instructions, verify they are actionable:

| Criteria | What to Check |
|----------|---------------|
| **Explicit commands** | Every step should say `npm install`, `docker-compose up`, NOT "install dependencies" |
| **No missing context** | Can someone who has never seen the repo build and run it? |
| **Error handling** | What to do if a step fails? (common errors section) |
| **Environment differences** | Are dev vs. prod differences documented? |
| **Required accounts** | Are accounts needed (Stripe, SendGrid, etc.) listed? |
| **Seed data** | Is there a way to verify the system works after setup? |

**Step 4: Estimate Rebuild Effort**

Based on the implementation guide, estimate:

```
## Rebuild Effort Estimate

### Assumptions
- Team: 2 senior engineers, 1 junior engineer
- Familiarity: New to the codebase, experienced with the tech stack

### Phase Estimates
| Phase | Focus | Days | Confidence |
|-------|-------|------|------------|
| Foundation | Scaffolding, DB, config, error handling | 3 | HIGH |
| Core Domain | User, auth, session | 4 | HIGH |
| Features | All business features | 10 | MEDIUM |
| Integration | External services, events | 5 | MEDIUM |
| Testing | Unit, integration, e2e | 5 | MEDIUM |
| Deployment | Infra, CI/CD, monitoring | 3 | HIGH |

### Total Estimate
30 days (6 weeks) for a 3-person team

### Confidence: MEDIUM
- Feature complexity has unknowns
- External API integration behavior must be verified
```

**Step 5: Issue Remaining Issues**

If the verification found any issues:

| Issue ID | Artifact | Description | Severity | Fix Required Before Rebuild |
|----------|----------|-------------|----------|----------------------------|
| R01 | 02_BUILD_AND_RUN.md | Missing Redis setup step | HIGH | Yes |
| R02 | 05_API_REFERENCE.md | 3 endpoints missing response schemas | MEDIUM | Recommended |

**Step 6: Certification Decision**

| Certification Level | Criteria |
|--------------------|----------|
| **REBUILD-READY** | All artifacts complete, accurate, and actionable. Team can rebuild. |
| **REBUILD-READY WITH NOTES** | Minor gaps exist but documented. Team can rebuild with caution. |
| **NEEDS REVISION** | Significant gaps. Team would get stuck without original source. |

---

## 4. EXECUTION INSTRUCTIONS

1. **Simulate the build process mentally.** Walk through each step of 02_BUILD_AND_RUN.md as if you were a developer who has never seen this system. Where would you get stuck?

2. **Check dependencies down to specific versions.** "PostgreSQL" is not enough — "PostgreSQL 15.4" is required.

3. **Verify the API reference is usable.** Can a frontend developer build a client using only the API reference in the rebuild package?

4. **Document everything that's missing.** If a step says "configure the payment service" without specifying the service name, API key format, or test mode — that's a gap.

---

## 5. OUTPUT SPECIFICATION

Generate `36_rebuild_verification.md`:

### 5.1 Verification Summary

| Metric | Value |
|--------|-------|
| Artifacts verified | [X/9] |
| Completeness score | [X]% |
| Accuracy score | [X]% |
| Actionability score | [X]% |
| Issues found | [X] |
| Critical issues | [X] |

### 5.2 Artifact-by-Artifact Verification

[Detailed results for each of the 9 artifacts]

### 5.3 Rebuild Effort Estimate

[Effort table with confidence levels]

### 5.4 Issue Register

[All issues with severity and required fixes]

### 5.5 Certification

**Rebuild Package Certification:**

| Level | Decision |
|-------|----------|
| REBUILD-READY | [ ] |
| REBUILD-READY WITH NOTES | [ ] |
| NEEDS REVISION | [ ] |

**Certifying Authority:** Reverse Engineering Prompt Framework v1.0 — Rebuild Verifier

**Date:** [Current date]

**Rebuild Package Path:** [Full path to rebuild-package/]

**Notes:** [Any conditions or warnings for the rebuild team]

---

## 6. QUALITY GATE

- [ ] All 9 rebuild artifacts verified for completeness
- [ ] Key artifacts verified for accuracy against original analysis
- [ ] Build & run instructions verified for actionability
- [ ] Rebuild effort estimated
- [ ] Issue register created
- [ ] Certification decision made

---

## 7. PROJECT COMPLETE

Congratulations. The Enterprise Reverse Engineering Prompt Framework has completed its FULL pipeline:

```
Phase 1  — Discovery        ✓
Phase 2  — Structural       ✓
Phase 3  — Architecture     ✓
Phase 4  — Deep Code        ✓
Phase 5  — AI Analysis      ✓ (conditional)
Phase 6  — Integration      ✓
Phase 7  — Documentation    ✓
Phase 8  — Validation       ✓
Phase 9  — Rebuild Package  ✓
```

The deliverables are:
1. **Analysis Directory** — all phase-by-phase analysis files
2. **Documentation Suite** — handbooks, guides, references, notes
3. **Rebuild Package** — self-contained rebuild artifacts
4. **Validation Reports** — accuracy, completeness, consistency, sign-off
5. **This Verification** — final certification of rebuild readiness
