# GLOSSARY

> Standardized terminology used throughout this framework and its outputs. All documentation MUST use these terms consistently.

---

## A

| Term | Definition |
|------|------------|
| **Agent** | An AI system that can act autonomously, following prompts, using tools, and making decisions within defined boundaries. |
| **Analysis Boundary** | The scope of a single analysis — typically the repository root directory. |
| **Anchor** | A file path + line number reference linking a documentation claim to source code. |
| **Anti-pattern** | A known ineffective or counterproductive design pattern that appears in the codebase. |
| **Architecturally Significant** | A file, module, or component that is critical to understanding the system's structure and behavior. |
| **Artifact** | Any file produced by the framework, including documentation, diagrams, summaries, and analysis notes. |

## B

| Term | Definition |
|------|------------|
| **Bounded Context** | A logical boundary within which a particular domain model applies (Domain-Driven Design concept). |
| **Boundary** | The edge of a system or component where it interacts with external systems, services, or users. |

## C

| Term | Definition |
|------|------------|
| **Call Graph** | A directed graph representing calling relationships between functions or methods. |
| **Component** | A distinct, independently deployable or replaceable part of the system. |
| **Component Diagram** | A diagram showing how components relate to each other through their interfaces. |
| **Configuration Point** | Any parameter, environment variable, config file entry, or runtime setting that changes system behavior. |
| **Context Summary** | A structured document passed between phases, summarizing key findings for the next phase. |
| **Cross-Reference** | A link from one documentation artifact to another related artifact. |

## D

| Term | Definition |
|------|------------|
| **Data Flow** | The path data takes through the system from source (input, file, network) to sink (output, database, display). |
| **Dependency** | A relationship where one module requires another to function. |
| **Dependency Graph** | A directed graph representing dependency relationships between modules or components. |
| **Design Pattern** | A reusable solution to a commonly occurring problem in software design. |
| **Documentation Artifact** | A deliverable document produced by a prompt execution. |

## E

| Term | Definition |
|------|------------|
| **Edge Case** | A boundary condition, unusual input, or exceptional state that the code must handle. |
| **Entry Point** | A function, method, or handler that is called externally (by the runtime, framework, user, or another service). |
| **Execution Path** | The sequence of function calls and control flow decisions from an entry point to a terminal state. |
| **External Dependency** | A dependency on code outside the repository (libraries, services, APIs). |

## F

| Term | Definition |
|------|------------|
| **Feature** | A unit of functionality that delivers value to a user or another system. |
| **Feature Map** | A mapping from features to the components and code that implement them. |
| **Flowchart** | A diagram representing a process, workflow, or algorithm with decision points and branches. |

## G

| Term | Definition |
|------|------------|
| **Generated Code** | Code produced by a tool or generator, not written by humans. Tagged as `[GENERATED]`. |
| **Guard** | A condition that gates a state transition or code path. |

## H

| Term | Definition |
|------|------------|
| **Handoff** | The transfer of context and findings from one phase to the next, including the Context Summary. |
| **Hot Path** | The most frequently executed code path in a system. |

## I

| Term | Definition |
|------|------------|
| **Interface** | A defined boundary through which components communicate. |
| **Internal Dependency** | A dependency on code within the same repository. |
| **Inventory** | The complete list of files and directories in the repository. |

## J

| Term | Definition |
|------|------------|
| **Join Point** | A point in the pipeline where parallel branches converge. |

## L

| Term | Definition |
|------|------------|
| **Layer** | A horizontal slice of the architecture with a specific responsibility (presentation, business logic, data access). |
| **Layer Violation** | A dependency that crosses architectural layers in an unauthorized direction. |

## M

| Term | Definition |
|------|------------|
| **Module** | A logical grouping of related code — typically a directory or a file that exports/imports functionality. |
| **Module Map** | A high-level map showing all modules and their relationships. |

## P

| Term | Definition |
|------|------------|
| **Phase** | A major stage in the reverse engineering pipeline, consisting of one or more prompts. |
| **Prompt** | A complete set of instructions for an AI agent. In this framework, a single `.md` file. |
| **Prompt Architecture** | The structure, organization, and interrelationship of all prompts in an AI-powered system. |

## Q

| Term | Definition |
|------|------------|
| **Quality Gate** | A check that must pass before analysis proceeds to the next phase. |
| **Quality Standard** | A defined level of quality that an artifact must meet. |

## R

| Term | Definition |
|------|------------|
| **Rebuild Guide** | A document with step-by-step instructions to rebuild the system from scratch. |
| **Repository** | The codebase being analyzed — the set of all files in scope. |

## S

| Term | Definition |
|------|------------|
| **Sequence Diagram** | A diagram showing interactions between components in time order. |
| **Side Effect** | Any observable change in system state caused by a function beyond returning a value. |
| **State Machine** | A model of a system with a finite number of states and transitions between them. |
| **Structural Analysis** | Analysis of the static structure of the code without executing it. |
| **System** | The entire software product under analysis. |

## T

| Term | Definition |
|------|------------|
| **Technology Stack** | The set of languages, frameworks, libraries, and tools used by the system. |
| **Traceability** | The ability to link any documentation claim back to specific source code. |

## V

| Term | Definition |
|------|------------|
| **Validation** | The process of checking that documentation accurately reflects the source code. |
| **Verification** | The process of checking that documentation is internally consistent and meets quality standards. |

## W

| Term | Definition |
|------|------------|
| **Workflow** | A sequence of steps or tasks that accomplish a specific goal. |
