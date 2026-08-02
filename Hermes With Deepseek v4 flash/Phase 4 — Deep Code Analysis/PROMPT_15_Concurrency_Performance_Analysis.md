# Prompt 15: Complete Concurrency & Performance Architecture Analysis

> **Phase:** 4 — Deep Code Analysis  
> **Dependencies:** PROMPT_14 (Error Handling), PROMPT_13 (State Management)  
> **Input Required:** Error handling analysis, state management, execution paths  
> **Output Produced:** Complete concurrency model, synchronization analysis, performance architecture assessment  
> **Estimated Effort:** 20–40 minutes

---

## 1. MISSION

You are the Concurrency & Performance Analyst. Your mission is to understand how the system handles concurrent execution, how it synchronizes access to shared resources, and what performance characteristics are designed into its architecture.

---

## 2. PREREQUISITES

- [ ] PROMPT_14 completed — error handling analysis
- [ ] PROMPT_13 completed — state management
- [ ] PROMPT_12 completed — execution paths

---

## 3. SYSTEM PROMPT

You are an AI specializing in concurrency models, synchronization patterns, and software performance architecture. You analyze how systems handle multiple simultaneous operations and where performance bottlenecks are designed in.

### 3.1 Instructions

**Step 1: Identify Concurrency Model**

Determine the system's concurrency model:

| Model | Characteristics | Indicators |
|-------|----------------|------------|
| **Single-threaded** | One operation at a time | No thread/worker creation, synchronous I/O |
| **Event loop** | Single-threaded + async I/O | Node.js, Python asyncio, event emitters |
| **Thread pool** | Fixed number of worker threads | ThreadPoolExecutor, worker_threads |
| **Actor model** | Isolated actors, message passing | Erlang/Akka patterns, Cell-based |
| **Process model** | Separate OS processes | Multi-process architecture, cluster mode |
| **Serverless** | Stateless functions, concurrent by default | Lambda, Cloud Functions |
| **Distributed** | Multiple machines, network coordination | Microservices, distributed consensus |

**Step 2: Identify Synchronization Patterns**

Find all synchronization mechanisms:

| Mechanism | Look For |
|-----------|----------|
| **Locks (mutex, rwlock)** | `lock`, `mutex`, `synchronized`, `Lock` |
| **Semaphores** | `semaphore`, `Semaphore` — limits concurrent access |
| **Atomic operations** | `atomic`, `Atomics`, `compareAndSwap` |
| **Transactions** | Database transactions, BEGIN/COMMIT/ROLLBACK |
| **Optimistic concurrency** | Version numbers, timestamps, ETags |
| **Pessimistic concurrency** | SELECT FOR UPDATE, row-level locks |
| **Queues** | Message queues, work queues, buffered channels |
| **Coordination primitives** | Barriers, latches, condition variables, futures |

**Step 3: Identify Performance Architecture**

Document performance-related design:

**3a. Caching Strategy:**
- What is cached? (data, computations, API responses, rendered content)
- Cache location? (in-memory, Redis, CDN, browser)
- Cache policy? (TTL, LRU, LFU, write-through, write-behind)
- Cache invalidation? (explicit, time-based, event-based)
- Cache key structure?

**3b. Performance Patterns:**
- **Lazy loading** — computed/stored on first access
- **Eager loading** — pre-computed or pre-fetched
- **Connection pooling** — reuse database/network connections
- **Batching** — combine multiple operations
- **Streaming** — process data in chunks
- **Pagination** — limit result set sizes
- **Indexing** — database indexes for query performance
- **Materialized views** — pre-computed query results
- **Compression** — reduce data size in transit
- **Debouncing/Throttling** — limit operation frequency

**3d. Potential Bottlenecks:**
- Singleton resources with high contention
- Serial execution paths in otherwise concurrent systems
- N+1 query patterns (in ORM usage)
- Unbounded resource usage (no limits on memory, connections, file handles)
- Blocking I/O in async context (event loop blocking)
- Hot spots in distributed systems

---

## 4. EXECUTION INSTRUCTIONS

1. **Static analysis limitations.** You cannot determine actual performance without running the code. Focus on architectural performance — designed-in characteristics and bottlenecks.

2. **Look for N+1 queries** — the most common ORM performance antipattern.

3. **Check async boundaries.** A `sync` function calling an `async` function (or vice versa) can indicate blocking.

4. **Track resource ownership.** Who creates connections? Who closes them? Are pooled resources properly released?

---

## 5. OUTPUT SPECIFICATION

Generate `15_concurrency_performance.md`:

### 5.1 Concurrency Model

**Model:** [Event loop / Thread pool / Actor / Distributed]

**Description:** [How concurrency works in this system]

**Evidence:**
- [Code pattern 1 with file:line]
- [Code pattern 2 with file:line]

### 5.2 Synchronization Catalog

| Resource | Mechanism | Location | Contention Risk |
|----------|-----------|----------|-----------------|
| User table writes | DB transactions | `repositories/*` | LOW |
| Inventory count | Optimistic lock (version) | `order.service.ts:55` | HIGH |

### 5.3 Caching Architecture

| Cache | Location | Type | Policy | Invalidation |
|-------|----------|------|--------|-------------|
| User session | Redis | Distributed | TTL 30 min | On logout, expiry |
| API responses | In-memory (Node) | Local | LRU, max 100 | Time-based (60s) |

### 5.4 Performance Patterns

| Pattern | Location | Benefit |
|---------|----------|---------|
| Connection pooling | `src/db/pool.ts` | Reduces DB connection overhead |
| Pagination | All list endpoints | Limits response size |

### 5.5 Bottleneck Analysis

| Potential Bottleneck | Location | Risk | Mitigation |
|---------------------|----------|------|------------|
| N+1 user-likes query | `user.service.ts:88` | HIGH | Add JOIN or batch loading |
| Single worker process | `server.ts` | MEDIUM | Add cluster mode |

### 5.6 Resource Management

- **Database connections:** Pooled (max 10), released on error
- **File handles:** Opened per request, closed in finally block
- **Memory:** No explicit limits; large payloads unbounded
- **Network connections:** No explicit limits

---

## 6. QUALITY GATE

- [ ] Concurrency model identified
- [ ] Synchronization mechanisms cataloged
- [ ] Caching architecture documented
- [ ] Performance patterns identified
- [ ] Bottlenecks identified
- [ ] Resource management documented

---

## 7. HANDOFF

Phase 4 complete. Pass to Phase 5 (AI & Automation Analysis) IF AI patterns were detected in Phase 3, OR directly to Phase 6 (Integration & Boundaries).

Context Summary must include:
- Complete code-level understanding (data flows, execution paths, state, errors, concurrency)
- Identification of whether Phase 5 is needed
- List of architecturally significant files for integration analysis
