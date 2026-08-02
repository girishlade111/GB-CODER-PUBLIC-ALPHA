# Prompt 35: Complete Rebuild Package Assembly

> **Phase:** 9 — Rebuild Package  
> **Dependencies:** P34 (Final Quality Gate), ALL Phase 1-7 outputs, P31-P33 corrections  
> **Input Required:** Complete validated documentation from ALL phases  
> **Output Produced:** Comprehensive Rebuild Package — a self-contained set of artifacts sufficient to rebuild the system from scratch  
> **Estimated Effort:** 30–60 minutes

---

## 1. MISSION

You are the Rebuild Package Architect. Your mission is to synthesize every finding from all phases into a REBUILD PACKAGE — a compressed, actionable set of artifacts that enables a development team to rebuild the entire system from scratch without reference to the original source code.

This is the ultimate test of reverse engineering quality: if the rebuild package is complete and accurate, a competent team can rebuild the system. If not, the reverse engineering is incomplete.

---

## 2. PREREQUISITES

- [ ] P34 completed — quality sign-off achieved (at minimum PASS WITH NOTES)
- [ ] ALL Phase 1-7 outputs available and corrected
- [ ] All P31-P33 corrections applied

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Assemble the Rebuild Blueprint**

The rebuild package must contain the following artifacts, all consolidated into one deliverable directory:

### Artifact A: System Specification

A concise (3-5 page) document containing:

- **System Purpose** — what the system does (one paragraph)
- **Functional Overview** — capabilities and features (one page)
- **Technology Stack** — with exact versions (table)
- **External Dependencies** — services, APIs, databases (table with versions)
- **Architecture Overview** — C4 context + container diagrams
- **Key Decisions** — top 10 architecture decisions (ADR references)
- **Constraints** — performance, security, compliance requirements

### Artifact B: Build & Run Instructions

Step-by-step instructions to build and run the system:

```markdown
## Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Create database: `createdb app_db`
4. Run migrations: `npm run migrate`
5. Configure environment (see Artifact D)
6. Start: `npm run dev`

## Verify
- Health check: `curl http://localhost:3000/health`
- Run tests: `npm test`
```

### Artifact C: Data Model

Complete data model with:

- **Entity-Relationship Diagram** (Mermaid ER diagram)
- **Schema Definitions** (all tables/collections with exact columns, types, constraints, indexes)
- **Migration Sequence** (order of schema changes)
- **Seed Data** (required initial data)

### Artifact D: Environment Configuration

Complete configuration matrix:

| Variable | Description | Required | Dev Default | Production |
|----------|-------------|----------|-------------|------------|
| DATABASE_URL | PostgreSQL connection | YES | postgresql://localhost:5432/dev | Secret store |

### Artifact E: API Surface

Reference of every API:

```
### POST /api/users
- Purpose: Create user account
- Request body: { name, email, password }
- Response: 201 { id, name, email, createdAt }
- Auth: Required
- Rate limit: 10/min per IP
```

### Artifact F: Implementation Guide

Implementation sequence — the order to build the system:

```
Phase 1: Foundation (Days 1-3)
├── Project scaffolding
├── Database setup
├── Configuration system
└── Error handling infrastructure

Phase 2: Core Domain (Days 4-7)
├── User module
├── Auth module
├── Session management
└── Basic middleware stack

...
```

### Artifact G: Key Algorithm Reference

The 5-10 most critical algorithms with pseudocode:

```
## Algorithm: Token Validation Flow

1. Extract Authorization header
2. Decode JWT without verification (get header)
3. Determine signing algorithm from header
4. Fetch signing key (RS256) or use secret (HS256)
5. Verify signature using crypto library
6. Check expiry (iat, exp claims)
7. Check revocation status (Redis blacklist)
8. Return decoded payload or throw error
```

### Artifact H: Testing Strategy

- What to unit test (with examples)
- What to integration test (with examples)
- What to end-to-end test (with examples)
- Test data requirements

### Artifact I: Deployment Architecture

- Infrastructure diagram
- Container definitions (Dockerfile patterns)
- CI/CD pipeline steps
- Monitoring setup
- Backup strategy

---

## 4. EXECUTION INSTRUCTIONS

1. **Synthesize, don't copy.** The rebuild package should be MORE concise than the full documentation. Extract the essential information needed to rebuild, not every detail from every phase.

2. **Keep it actionable.** Every instruction must be precise enough to execute. "Set up the database" is too vague. "Run `create database app_db;` and then execute `npm run migrate`" is actionable.

3. **List dependencies explicitly.** Every external service, every library version, every environment variable — if it's needed to run the system, it MUST be in the rebuild package.

4. **Assume NO access to original code.** The rebuild package is the ONLY reference the team has.

---

## 5. OUTPUT SPECIFICATION

Generate the rebuild package as a directory with the following files:

```
rebuild-package/
├── README.md                              # Package overview and navigation
├── 01_SYSTEM_SPECIFICATION.md             # Artifact A
├── 02_BUILD_AND_RUN.md                    # Artifact B
├── 03_DATA_MODEL.md                       # Artifact C (with Mermaid ER diagram)
├── 04_ENVIRONMENT_CONFIG.md               # Artifact D
├── 05_API_REFERENCE.md                    # Artifact E
├── 06_IMPLEMENTATION_GUIDE.md             # Artifact F
├── 07_KEY_ALGORITHMS.md                   # Artifact G
├── 08_TESTING_STRATEGY.md                 # Artifact H
└── 09_DEPLOYMENT_ARCHITECTURE.md          # Artifact I
```

Also generate `35_rebuild_package_assembly.md` (this prompt's executive summary) recording:
- What was included in the package
- What was intentionally excluded (and why)
- Confidence level in rebuild accuracy
- Known gaps or risks
- Reference to P36 (Rebuild Verification)

---

## 6. QUALITY GATE

- [ ] System specification complete (purpose, tech stack, architecture, decisions)
- [ ] Build & run instructions verifiable (any team can follow and succeed)
- [ ] Data model complete (ER diagram + schema definitions)
- [ ] Environment configuration complete (every env var documented)
- [ ] API reference complete (every endpoint documented)
- [ ] Implementation guide with sequenced phases
- [ ] Key algorithms documented (top 5-10)
- [ ] Testing strategy documented
- [ ] Deployment architecture documented
- [ ] Rebuild is POSSIBLE using this package alone (no original source needed)

---

## 7. HANDOFF

Pass to P36 (Rebuild Verification Protocol) with:
- The complete rebuild package
- Confidence level and known risks
- Areas where verification should focus
