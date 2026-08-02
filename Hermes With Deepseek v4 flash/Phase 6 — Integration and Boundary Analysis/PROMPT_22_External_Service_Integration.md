# Prompt 22: Complete External Service Integration Analysis

> **Phase:** 6 — Integration & Boundary Analysis  
> **Dependencies:** PROMPT_21 (Internal API Contracts)  
> **Input Required:** Internal API contracts, dependency graph (external dependencies)  
> **Output Produced:** Complete catalog of all external services with integration patterns, authentication, and failure modes  
> **Estimated Effort:** 25–50 minutes

---

## 1. MISSION

You are the External Integration Analyst. Your mission is to catalog every external service the system depends on, document how each integration works, and analyze the system's resilience to external service failures.

---

## 2. PREREQUISITES

- [ ] PROMPT_21 completed — internal API contracts
- [ ] PROMPT_05 completed — dependency graph (external dependencies identified)

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Identify Every External Service**

Find every point where the system communicates with an external service:

- **HTTP/REST API calls** — to third-party services
- **Database connections** — external databases
- **Message queues** — external message brokers
- **File storage** — S3, GCS, blob storage
- **Email/SMS services** — SendGrid, Twilio, SES
- **Payment processors** — Stripe, Razorpay, PayPal
- **AI/LLM APIs** — OpenAI, Anthropic, Google AI
- **Authentication providers** — Auth0, Okta, social login
- **Monitoring/observability** — Sentry, Datadog, LogDNA
- **CDN/caching** — CloudFront, Cloudflare, Akamai

**Step 2: Document Each External Integration**

```
## External Service: OpenAI API

### Purpose
LLM inference for all AI agent operations

### Integration Point
File: `src/services/llm/provider.ts:20-120`
Pattern: HTTP REST client with retry

### Authentication
Type: API Key
Location: Environment variable `OPENAI_API_KEY`
Rotation: Unknown (static key in env config)

### Contract
Endpoint: POST https://api.openai.com/v1/chat/completions
Request: ChatCompletionRequest — { model, messages, temperature, max_tokens }
Response: ChatCompletionResponse — { id, choices, usage }
Rate Limit: 500 RPM (tier-dependent)

### Error Handling
- 401 Unauthorized: Log error, disable AI features, alert admin
- 429 Rate Limited: Exponential backoff (max 3 retries), queue overflow to DLQ
- 500 Server Error: Retry with backoff, fall back to cached response
- Timeout: Retry once with extended timeout, then fail gracefully

### Failover/Redundancy
- Primary: OpenAI (gpt-4-turbo)
- Fallback: Anthropic (claude-3-sonnet) — configured in `src/config/llm.ts:30`
- Offline mode: Limited functionality without LLM (cached/rule-based responses)

### Dependency Impact
If this service fails:
- AI agent features: UNAVAILABLE
- Rule-based features: WORKING (degraded)
- Cached responses: AVAILABLE (for repeated queries)
```

**Step 3: Create External Dependency Map**

Visualize all external dependencies and their relationships:

```
System
├──→ OpenAI API (AI inference) ←── Fallback → Anthropic API
├──→ SendGrid API (email)
├──→ Stripe API (payments)
├──→ PostgreSQL Database (self-hosted)
└──→ Redis Cache (self-hosted)
```

**Step 4: Analyze Dependency Criticality**

For each external service:

| Dimension | Assessment |
|-----------|-----------|
| **Criticality** | Can the system function without this service? |
| **Replaceability** | Can this service be swapped for another? |
| **Failure Impact** | What happens when this service is unavailable? |
| **Cost Profile** | Usage-based? Fixed? Scaling characteristics? |

---

## 5. OUTPUT SPECIFICATION

Generate `22_external_services.md`:

### 5.1 External Dependency Overview

[Summary of external dependencies]

### 5.2 External Service Catalog

| Service | Type | Purpose | Auth Method | Criticality | Fallback |
|---------|------|---------|-------------|-------------|----------|
| OpenAI | AI API | LLM inference | API Key | HIGH | Anthropic |
| SendGrid | Email | Transactional email | API Key | MEDIUM | SMTP direct |

### 5.3 Detailed Integration Documentation

[Full documentation per service — Step 2]

### 5.4 External Dependency Map

[Visual map of external services]

### 5.5 Dependency Criticality Matrix

[Criticality assessment for each service]

### 5.6 Failure Mode Analysis

[What happens when each external service fails]

---

## 6. QUALITY GATE

- [ ] All external services identified
- [ ] Each service has full integration documentation
- [ ] Authentication methods documented
- [ ] Error handling per service documented
- [ ] Failover/redundancy mechanisms documented
- [ ] Criticality assessed for each service

---

## 7. HANDOFF

Pass to PROMPT_23 (Event Stream Workflow):
- External services that emit events (webhooks)
- Event-driven interactions with external systems
