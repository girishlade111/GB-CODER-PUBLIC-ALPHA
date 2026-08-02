# VALIDATION CHECKLISTS

> Quality checklists for each phase of the reverse engineering pipeline. Use these to validate that each phase is complete before proceeding.

---

## PHASE 1: DISCOVERY CHECKLIST

### File Inventory

- [ ] All files in repository root are listed
- [ ] All subdirectories are explored (recursively)
- [ ] File count matches actual count from file system
- [ ] All file types are identified
- [ ] Hidden files and directories are included (with notation)
- [ ] Generated/dist directories are tagged as `[GENERATED]` or `[BUILD ARTIFACT]`
- [ ] Symlinks are identified with their targets

### Technology Stack

- [ ] All programming languages are identified
- [ ] All frameworks are identified with versions
- [ ] All major libraries are identified with versions
- [ ] Build system is identified
- [ ] Package manager is identified
- [ ] Language runtimes are identified (Node version, Python version, JVM, etc.)
- [ ] Container/Docker configuration is detected
- [ ] Test frameworks are identified
- [ ] Linting/formatting tools are identified
- [ ] CI/CD configuration is identified

### Ambiguities

- [ ] Files with unusual extensions are flagged
- [ ] Binary files are cataloged
- [ ] Empty directories are noted
- [ ] Unrecognized file types are listed for manual review
- [ ] Files outside the expected tech stack are flagged

---

## PHASE 2: STRUCTURAL ANALYSIS CHECKLIST

### Folder Architecture

- [ ] All directories are documented with their purpose
- [ ] Naming conventions are identified (kebab-case, camelCase, snake_case)
- [ ] Directory depth is documented
- [ ] Monorepo structure vs. single-project structure is determined
- [ ] Package/module boundaries are identified

### Module Dependencies

- [ ] Every import/require/include is traced
- [ ] External vs. internal dependencies are separated
- [ ] Circular dependencies are identified and documented
- [ ] Dependency direction follows architectural intent
- [ ] Missing dependencies are flagged as errors

### Entry Points

- [ ] All external entry points are identified (main functions, handlers, routes)
- [ ] All test entry points are identified
- [ ] All script entry points are identified (npm scripts, Makefile targets, etc.)
- [ ] Entry point signatures are documented
- [ ] Entry point callers are documented (who invokes what)

---

## PHASE 3: ARCHITECTURE RECONSTRUCTION CHECKLIST

### System Architecture

- [ ] Architecture style is identified (monolithic, microservices, event-driven, etc.)
- [ ] Major components are identified and named
- [ ] Component relationships are documented
- [ ] Component boundaries are clear
- [ ] Architecture diagram is complete

### Layer Analysis

- [ ] All architectural layers are identified
- [ ] Layer responsibilities are documented
- [ ] Layer-to-layer communication patterns are documented
- [ ] Layer violations are flagged
- [ ] Cross-cutting concerns are identified

### Design Patterns

- [ ] All recognized design patterns are cataloged
- [ ] Pattern implementations are mapped to code locations
- [ ] Pattern variants (deviations from canonical) are noted
- [ ] Anti-patterns are identified and documented
- [ ] Domain-specific patterns are named

---

## PHASE 4: DEEP CODE ANALYSIS CHECKLIST

### Data Flow

- [ ] All data sources are identified (user input, files, network, databases)
- [ ] All data sinks are identified (output, storage, network, display)
- [ ] Data transformation steps are documented
- [ ] Data validation logic is documented
- [ ] Data serialization/deserialization is documented

### Execution Paths

- [ ] All entry points have traced execution paths
- [ ] Conditional branches are documented with their conditions
- [ ] Error handling branches are documented
- [ ] Edge cases are documented
- [ ] Hot paths are identified

### State Management

- [ ] All state stores are identified (variables, databases, caches, files)
- [ ] State initialization is documented
- [ ] State transitions are documented
- [ ] Concurrency control is documented
- [ ] State persistence strategy is documented

### Error Handling

- [ ] All error types are cataloged
- [ ] Error propagation patterns are documented
- [ ] Retry strategies are documented
- [ ] Fallback behaviors are documented
- [ ] Error logging/monitoring is documented
- [ ] Graceful degradation is documented

---

## PHASE 5: AI & AUTOMATION ANALYSIS CHECKLIST

### Prompt Architecture

- [ ] All system prompts are identified
- [ ] Prompt structure and formatting are documented
- [ ] Prompt versioning strategy is identified
- [ ] Prompt injection risks are assessed
- [ ] Prompt optimization (caching, chunking) is documented

### Agent Workflows

- [ ] All agents are identified with their roles
- [ ] Agent communication patterns are documented
- [ ] Agent orchestration logic is documented
- [ ] Agent decision boundaries are documented
- [ ] Human-in-the-loop patterns are identified

### Tool Integration

- [ ] All tools available to agents are cataloged
- [ ] Tool interfaces are documented
- [ ] Tool execution safety is assessed
- [ ] Tool result handling is documented
- [ ] Tool availability/visibility per agent is documented

---

## PHASE 6: INTEGRATION & BOUNDARIES CHECKLIST

### API Contracts

- [ ] All internal APIs are identified
- [ ] API signatures are documented (parameters, return types)
- [ ] API versioning strategy is identified
- [ ] API authentication/authorization is documented
- [ ] API rate limiting is documented

### External Services

- [ ] All external service calls are cataloged
- [ ] Service endpoints are documented
- [ ] Authentication methods for external services are documented
- [ ] Failure handling for external calls is documented
- [ ] Data formats exchanged are documented

### Event Systems

- [ ] All event types are identified
- [ ] Event producers are identified
- [ ] Event consumers are identified
- [ ] Event payloads are documented
- [ ] Event ordering and delivery guarantees are documented

### Configuration

- [ ] All configuration sources are identified (env vars, files, databases, remote config)
- [ ] All configuration keys are documented with their effects
- [ ] Configuration default values are documented
- [ ] Configuration validation is documented
- [ ] Configuration secrets handling is assessed

---

## PHASE 7: DOCUMENTATION CHECKLIST

### Architecture Handbook

- [ ] System overview is comprehensive
- [ ] Architecture diagrams are complete and labeled
- [ ] Component descriptions are detailed
- [ ] Technology stack is summarized
- [ ] Design decisions are documented with rationale
- [ ] Cross-references to code are present

### Developer Handbook

- [ ] Development environment setup is documented
- [ ] Build commands are documented
- [ ] Test commands are documented
- [ ] Code organization is explained
- [ ] Common tasks are documented
- [ ] Troubleshooting guide is included

### Rebuild Guide

- [ ] Step-by-step build instructions are complete
- [ ] All required dependencies are listed with versions
- [ ] Configuration steps are explained
- [ ] Database setup is documented (if applicable)
- [ ] Deployment instructions are included
- [ ] Verification steps confirm successful build

### Diagrams

- [ ] System context diagram is present
- [ ] Component architecture diagram is present
- [ ] Data flow diagram is present (at least one)
- [ ] State diagrams are present (for stateful components)
- [ ] Sequence diagrams are present (for complex interactions)
- [ ] All diagrams are valid Mermaid syntax

---

## PHASE 8: VALIDATION CHECKLIST

### Accuracy

- [ ] 10% random sample of claims verified against source code
- [ ] All functional claims traceable to code locations
- [ ] No contradictory statements within or across documents
- [ ] All file paths in documentation are verified to exist

### Completeness

- [ ] Every file in scope is referenced in at least one document
- [ ] Every function in architecturally significant files is documented
- [ ] Every configuration point is documented
- [ ] Every external dependency is cataloged

### Consistency

- [ ] Terminology is consistent across all documents (verified against GLOSSARY)
- [ ] Naming conventions are consistent
- [ ] Document formats are consistent
- [ ] Diagram styles are consistent

### Quality Standards

- [ ] All documents pass Q1 (Technical Accuracy)
- [ ] All documents pass Q2 (Completeness)
- [ ] All documents pass Q3 (Traceability)
- [ ] All documents pass Q4 (Structural Quality)
- [ ] All documents pass Q5 (Diagram Quality)
- [ ] All documents pass Q6 (Consistency)
- [ ] All documents pass Q7 (Clarity)
- [ ] All documents pass Q8 (Verifiability)

---

## PHASE 9: REBUILD PACKAGE CHECKLIST

- [ ] All source files listed with their roles
- [ ] Complete build instruction set
- [ ] All dependencies listed with exact versions
- [ ] All configuration files documented
- [ ] Database schema and migration scripts documented (if applicable)
- [ ] Environment setup instructions
- [ ] Verification test to confirm successful rebuild
- [ ] Troubleshooting section for common build failures
