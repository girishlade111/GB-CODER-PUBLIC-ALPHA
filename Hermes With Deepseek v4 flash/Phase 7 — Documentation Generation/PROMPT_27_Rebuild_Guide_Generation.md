# Prompt 27: Complete Rebuild Guide Generation

> **Phase:** 7 — Documentation Generation  
> **Dependencies:** PROMPT_26 (Developer Handbook), All analysis phases  
> **Input Required:** Complete system understanding from all phases  
> **Output Produced:** Rebuild Guide — the documentation needed to reimplement the entire system from scratch  
> **Estimated Effort:** 30–60 minutes

---

## 1. MISSION

You are the Rebuild Guide Author. Your mission is to create a guide so complete that a competent engineering team could rebuild the entire system from scratch using only this document and the analysis files, without reference to the original source code.

---

## 2. PREREQUISITES

- [ ] PROMPT_26 completed — developer handbook
- [ ] All phase outputs available for detail extraction

---

## 3. SYSTEM PROMPT

### 3.1 Guide Structure

Generate `REBUILD_GUIDE.md`:

### Section 1: System Blueprint

A one-page overview of the entire system:
- **Core purpose** (one sentence)
- **Architecture pattern** (layered, microservices, monolith, agent-based)
- **Component diagram** (the 5-8 core components with their relationships)
- **Technology stack** (languages, frameworks, databases, services)
- **Key external dependencies** (what cannot be self-hosted)

### Section 2: Data Model

- **Complete schema** (all tables/collections with fields, types, constraints)
- **Relationships** (foreign keys, references, join tables)
- **Indexes** (performance-critical indexes)
- **Migrations** (sequence of schema changes)
- **Data flow diagram** (which components read/write which data)

### Section 3: API Contracts

- **Internal service contracts** — every significant service interface with input/output/errors
- **External API contracts** — every external service with endpoint, auth, request/response
- **Event contracts** — every event with schema, producer, consumer

### Section 4: Implementation Sequence

The order in which to build the system:

```
Phase A: Foundation (Week 1-2)
1. Project scaffolding (monorepo, build system, CI)
2. Database schema and migrations
3. Configuration system
4. Logging and error handling infrastructure

Phase B: Core Domain (Week 3-4)
5. User model and repository
6. User service and controller
7. Authentication middleware
...

Phase C: Features (Week 5-8)
...
```

For each phase:
- **Prerequisites** — what must be built first
- **Files to create** — what files, their responsibilities, key functions
- **Key algorithms** — important business logic to get right
- **Testing strategy** — what tests to write at this phase
- **Validation** — how to verify the phase is complete

### Section 5: Critical Algorithms

Document the 3-5 most complex algorithms in the system:

```
## Algorithm: Token Validation (auth.ts:30-65)

### Purpose
Validate JWT tokens and extract user identity

### Input
- `token: string` — JWT from Authorization header

### Output
- `payload: JwtPayload` — decoded and verified token data

### Process
1. Decode base64 header → identify algorithm (RS256/HS256)
2. Fetch signing key from key store (RS256) or use secret (HS256)
3. Verify signature using cryptographic library
4. Check expiration (iat, exp claims)
5. Check if token is revoked (blacklist lookup)
6. Return decoded payload

### Edge Cases
- Expired token → AuthenticationError("Token expired")
- Invalid signature → AuthenticationError("Invalid token")
- Revoked token → AuthenticationError("Token revoked")
- Malformed token → ValidationError("Invalid token format")

### Implementation Notes
- Uses jsonwebtoken library
- Key store caches public keys for 1 hour
- Blacklist is Redis-backed with TTL matching token expiry
```

### Section 6: Configuration Blueprint

- Complete environment variable table
- Default values for development
- Required vs. optional configuration
- Secret management strategy

### Section 7: Testing Strategy

- **Unit test targets** — what should be unit-tested
- **Integration test targets** — what needs the database/external services
- **End-to-end test targets** — critical user journeys
- **Mocking strategy** — what to mock, what not to mock
- **Test data** — fixtures, factories, seed data

### Section 8: Deployment Blueprint

- Infrastructure requirements (compute, storage, network)
- Container definitions (Dockerfiles)
- CI/CD pipeline steps
- Environment configuration per environment
- Monitoring and alerting setup
- Backup and disaster recovery

---

## 5. QUALITY GATE

- [ ] System blueprint (one-page architecture overview)
- [ ] Complete data model with schema and relationships
- [ ] API contracts documented
- [ ] Implementation sequence with phases
- [ ] Critical algorithms documented with edge cases
- [ ] Configuration blueprint (all env vars)
- [ ] Testing strategy documented
- [ ] Deployment blueprint documented
- [ ] Rebuild is possible using this guide + dependencies only

---

## 6. HANDOFF

Pass to PROMPT_28 (API Reference) and PROMPT_29 (Engineering Notes):
- API contracts feed into API reference
- Implementation notes feed into engineering notes
