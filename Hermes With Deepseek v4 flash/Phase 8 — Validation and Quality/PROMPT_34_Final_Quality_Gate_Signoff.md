# Prompt 34: Final Quality Gate & Sign-Off

> **Phase:** 8 — Validation and Quality  
> **Dependencies:** P31 (Accuracy), P32 (Completeness), P33 (Consistency)  
> **Input Required:** All three prior validation reports, all documentation files  
> **Output Produced:** Final quality gate report with scorecard, risk assessment, sign-off decision, and action register  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the Quality Gate Officer. Your mission is to run the FINAL quality check on the entire reverse engineering project. This is the last validation step before the documentation is delivered. You must produce a definitive quality score, identify any remaining risks, and make the sign-off decision.

---

## 2. PREREQUISITES

- [ ] P31 completed — accuracy corrections applied
- [ ] P32 completed — completeness gaps noted
- [ ] P33 completed — consistency and cross-reference fixes applied
- [ ] All documentation files in their final state

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Run the Master Quality Scorecard**

Evaluate every dimension of quality from QUALITY_STANDARDS.md (Q1-Q8):

| Standard | Criteria | Weight | Score (1-5) | Weighted |
|----------|----------|--------|-------------|----------|
| **Q1: Completeness** | All files covered, all concerns addressed | 20% | [X] | [X*20%] |
| **Q2: Accuracy** | Truthful, verified against source code | 25% | [X] | [X*25%] |
| **Q3: Consistency** | Terminology, structure, cross-references | 10% | [X] | [X*10%] |
| **Q4: Readability** | Clear, well-structured, understandable | 10% | [X] | [X*10%] |
| **Q5: Actionability** | Useful for its purpose (rebuild, onboard, audit) | 15% | [X] | [X*15%] |
| **Q6: Maintainability** | Follows conventions, easy to update | 5% | [X] | [X*5%] |
| **Q7: Traceability** | Every claim has source reference | 10% | [X] | [X*10%] |
| **Q8: Diagram Quality** | Appropriate use, accurate, well-formatted | 5% | [X] | [X*5%] |

**Final Score:** [Sum of weighted scores] / 5.0

**Step 2: Risk Assessment**

Identify any remaining risks in the documentation:

| Risk | Description | Likelihood | Impact | Mitigation |
|------|-------------|------------|--------|------------|
| Missing auth flow details | Token refresh flow not documented | MEDIUM | HIGH for implementation | Document in P14 supplement |
| Stale dependency versions | Library versions from P03 may be outdated | HIGH | MEDIUM | Add "checked on [date]" note |
| Deployment gaps | No CI/CD pipeline documentation | LOW | MEDIUM for operations | Flag for Phase 9 rebuild package |

**Step 3: Action Register**

Collect ALL outstanding actions from P31-P33:

| ID | Source | Action | Priority | Status | Assigned To |
|----|--------|--------|----------|--------|-------------|
| A01 | P31 | Fix line number in P14: user.service.ts line 63→65 | HIGH | OPEN | — |
| A02 | P32 | Add deployment architecture analysis | MEDIUM | OPEN | — |
| A03 | P33 | Standardize "user registration" across all P07, P21, P25 | LOW | OPEN | — |

**Step 4: Make Sign-Off Decision**

Based on the scorecard and risk assessment:

| Decision | Criteria |
|----------|----------|
| **PASS** | Score ≥ 4.0, no CRITICAL risks, all HIGH issues resolved |
| **PASS WITH NOTES** | Score ≥ 3.0, no CRITICAL risks, HIGH issues documented |
| **CONDITIONAL PASS** | Score ≥ 2.5, HIGH risks have mitigations documented |
| **FAIL** | Score < 2.5, CRITICAL risks exist, HIGH issues unresolved |

For PASS WITH NOTES or CONDITIONAL PASS, specify conditions:
- "Pass granted on condition that deployment documentation is added (A02) within 2 weeks."
- "Pass granted. The following notes apply to consumers..."

---

## 4. EXECUTION INSTRUCTIONS

1. **This is the FINAL gate.** Be honest and thorough. It is better to flag issues now than for someone to discover them later.

2. **Review ALL three prior validation reports** (P31, P32, P33) before making your assessment.

3. **Your quality score should reflect the remaining issues.** If there are open HIGH issues, the score cannot be "pass."

4. **Be clear about what "pass" means.** "Pass" means the documentation is fit for its intended purpose — it does NOT mean perfect.

---

## 5. OUTPUT SPECIFICATION

Generate `34_final_quality_gate.md`:

### 5.1 Quality Scorecard

[Full Q1-Q8 evaluation with scores and comments]

### 5.2 Final Quality Score

| Dimension | Score | Interpretation |
|-----------|-------|---------------|
| Overall | [X.X] / 5.0 | [Excellent / Good / Adequate / Poor] |

### 5.3 Risk Register

[All remaining risks with likelihood, impact, and mitigation]

### 5.4 Outstanding Actions

[All open actions from P31-P33, prioritized]

### 5.5 Sign-Off Decision

**Decision:** [PASS | PASS WITH NOTES | CONDITIONAL PASS | FAIL]

**Conditions/Rationale:**
[Explanation of the decision]

**Signatory:**
Reverse Engineering Prompt Framework v1.0 — Quality Gate Officer

**Date:**
[Current date]

**Documentation Package:**
The complete documentation suite at [path] is certified as:
[Level 1: Certified Complete — no known issues]
[Level 2: Certified with Notes — minor issues documented]
[Level 3: Draft — significant work remains]

---

## 6. QUALITY GATE

- [ ] All Q1-Q8 standards evaluated
- [ ] Final quality score calculated
- [ ] Risk register complete
- [ ] Outstanding actions collected
- [ ] Sign-off decision made and documented
- [ ] Certification level assigned

---

## 7. HANDOFF

Phase 8 complete.

If rebuild package is requested → proceed to Phase 9 (P35, P36).
If no rebuild package needed → project complete.

**Context Summary for Phase 9:**
- Quality score and sign-off level (determines rebuild confidence)
- Outstanding actions (rebuild package must address them)
- Documentation package path
