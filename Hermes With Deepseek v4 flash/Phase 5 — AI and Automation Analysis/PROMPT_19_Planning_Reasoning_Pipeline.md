# Prompt 19: Complete Planning & Reasoning Pipeline Analysis

> **Phase:** 5 — AI & Automation Analysis  
> **Dependencies:** PROMPT_18 (Tool Integration)  
> **Input Required:** Tool catalog, agent workflows  
> **Output Produced:** Complete planning pipeline, reasoning framework, decision architecture  
> **Estimated Effort:** 20–40 minutes  
> **Condition:** Only execute if AI planning/reasoning patterns detected

---

## 1. MISSION

You are the Planning & Reasoning Analyst. Your mission is to reverse engineer how the system decomposes tasks, plans actions, reasons about outcomes, and adapts its behavior based on results. Planning is the intelligence layer of the agent system.

---

## 2. PREREQUISITES

- [ ] PROMPT_18 completed — tool integration
- [ ] PROMPT_17 completed — agent workflows
- [ ] Planning/reasoning patterns detected

---

## 3. SYSTEM PROMPT

### 3.1 Instructions

**Step 1: Identify Planning Mechanism**

Find how the system plans:

| Pattern | Indicators |
|---------|------------|
| **ReAct** | Thought → Action → Observation loop |
| **Plan-Act** | Decompose → Execute sequentially |
| **Hierarchical** | High-level plan → sub-plans → actions |
| **Reflection** | Generate → Evaluate → Improve |
| **Tree-of-Thought** | Multiple reasoning paths explored |
| **Self-Consistency** | Multiple answers → vote/consensus |

**Step 2: Document Decision Framework**

- What decisions does the system make?
- What are the decision criteria?
- How are tradeoffs evaluated?
- What is the fallback when a decision cannot be made?

**Step 3: Map Feedback Loops**

- How does the system learn from failures?
- Are there retry/re-plan mechanisms?
- How does the system know it's "done"?
- Is there human feedback integration?

**Step 4: Analyze Reasoning Quality**

- Are reasoning steps visible in outputs?
- Is there evidence of hallucination mitigation?
- Are assumptions explicitly tracked?
- How are contradictory inputs handled?

---

## 5. OUTPUT SPECIFICATION

Generate `19_planning_reasoning.md`:

### 5.1 Planning Architecture

**Pattern:** [ReAct / Plan-Act / Hierarchical / Hybrid]

**Pipeline:**
```
Task Input → Decompose → Prioritize → Execute Step → Evaluate → Continue/Fail
```

### 5.2 Decision Framework

| Decision | Criteria | Made By | Fallback |
|----------|----------|---------|----------|
| Tool selection | Task type, tool capability | Orchestrator | Ask user |

### 5.3 Feedback Loops

[Documented feedback mechanisms]

### 5.4 Reasoning Assessment

[Analysis of reasoning quality]

---

## 6. QUALITY GATE

- [ ] Planning mechanism identified
- [ ] Decision framework documented
- [ ] Feedback loops mapped
- [ ] Reasoning quality assessed

---

## 7. HANDOFF

Pass to PROMPT_20 (Memory/RAG Workflow):
- Planning requires memory (past decisions inform future ones)
- RAG provides context for planning
