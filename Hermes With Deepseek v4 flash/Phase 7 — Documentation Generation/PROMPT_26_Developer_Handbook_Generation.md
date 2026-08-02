# Prompt 26: Complete Developer Handbook Generation

> **Phase:** 7 — Documentation Generation  
> **Dependencies:** PROMPT_25 (Architecture Handbook)  
> **Input Required:** Architecture handbook, all phase analysis  
> **Output Produced:** Developer Handbook — practical day-to-day reference for engineers working on the codebase  
> **Estimated Effort:** 25–50 minutes

---

## 1. MISSION

You are the Developer Handbook Writer. Your mission is to create the practical reference guide that engineers use daily — code conventions, common patterns, debugging guides, and operational procedures.

---

## 2. PREREQUISITES

- [ ] PROMPT_25 completed — architecture handbook
- [ ] All phase outputs for pattern references

---

## 3. SYSTEM PROMPT

### 3.1 Guide Structure

Generate `DEVELOPER_HANDBOOK.md`:

### Section 1: Getting Started

- Prerequisites (language runtime, tools, accounts)
- Clone & install steps
- First build & run
- Configuration setup (which env vars are needed for dev)
- Verify everything works (smoke test)

### Section 2: Code Organization

- Repository folder tree (annotated with purpose of each directory)
- Module boundaries and naming conventions
- File naming patterns
- Import/export conventions

### Section 3: Coding Conventions

- Language-specific style guide
- Naming conventions (variables, functions, classes, files)
- Comment and documentation standards
- Error handling conventions (patterns to follow)
- Testing conventions (what to test, how to write tests)

### Section 4: Common Development Patterns

From Phase 3 pattern recognition:

- How to add a new feature (scaffold pattern)
- How to add a new API endpoint
- How to add a new database migration
- How to add a new external service integration
- How to add a new event type (if event-driven)
- How to add a new AI agent or tool (if AI system)

### Section 5: Debugging Guide

- How to enable debug logging
- Common issues and resolutions
- How to reproduce specific scenarios
- Debugging tools and commands
- How to inspect database state
- How to test external service integrations

### Section 6: Testing Guide

- Test suite structure
- How to run specific test categories
- How to write unit tests (with patterns from the codebase)
- How to write integration tests
- How to write end-to-end tests
- Test data and fixtures
- Coverage expectations

### Section 7: Troubleshooting

- "My change didn't take effect" checklist
- "The build is failing" checklist
- "The tests are failing" checklist
- "The database is out of sync" checklist
- "The external service is down" checklist

### Section 8: Performance Guidelines

- Performance principles (from PROMPT_15)
- Optimization patterns
- Bottleneck identification
- Caching rules (what to cache, what not to cache)

---

## 5. QUALITY GATE

- [ ] Getting started guide complete and verifiable
- [ ] Code organization documented with folder tree
- [ ] Coding conventions documented
- [ ] Common development patterns documented
- [ ] Debugging guide with common issues
- [ ] Testing guide with examples
- [ ] Troubleshooting checklists
- [ ] Performance guidelines

---

## 6. HANDOFF

Pass to PROMPT_27 (Rebuild Guide):
- All dependencies and configuration needed for a complete rebuild
- Development patterns for reimplementation guidance
