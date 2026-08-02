# DIAGRAM TEMPLATES

> Reusable Mermaid diagram templates for use in reverse engineering documentation. Adapt these templates for specific repositories.

---

## 1. SYSTEM CONTEXT DIAGRAM

Shows the system in its environment — external actors and systems it interacts with.

```mermaid
graph TD
    subgraph "External Actors"
        User[User / Client]
        Admin[Administrator]
    end
    
    subgraph "System Under Analysis"
        System[System Name]
    end
    
    subgraph "External Systems"
        ExtAPI[External API 1]
        ExtDB[(External Database)]
        ExtService[External Service 2]
    end
    
    User -->|HTTP/REST| System
    Admin -->|HTTPS| System
    System -->|API Calls| ExtAPI
    System -->|Read/Write| ExtDB
    System -->|Events| ExtService
```

---

## 2. COMPONENT ARCHITECTURE DIAGRAM

Shows the major components of the system and their relationships.

```mermaid
graph TD
    subgraph "Layer 1: Presentation"
        UI[UI Components]
        API[API Gateway]
    end
    
    subgraph "Layer 2: Application"
        Service[Service Layer]
        Auth[Auth Service]
        Cache[Cache Service]
    end
    
    subgraph "Layer 3: Domain"
        Domain[Domain Models]
        Logic[Business Logic]
    end
    
    subgraph "Layer 4: Infrastructure"
        Repo[Repository Layer]
        DB[(Database)]
        Queue[Message Queue]
        Storage[File Storage]
    end
    
    UI --> API
    API --> Auth
    API --> Service
    Service --> Domain
    Service --> Repo
    Service --> Cache
    Auth --> Repo
    Repo --> DB
    Repo --> Queue
    Service --> Storage
```

---

## 3. MODULE DEPENDENCY GRAPH

Shows dependencies between modules or packages.

```mermaid
graph TD
    module_a[Module A] -->|imports| module_b[Module B]
    module_a -->|imports| module_c[Module C]
    module_b -->|imports| module_d[Module D]
    module_c -->|imports| module_d
    module_c -->|imports| module_e[Module E]
    
    style module_a fill:#e1f5fe
    style module_d fill:#fff3e0
    style module_e fill:#fce4ec
```

---

## 4. LAYER ARCHITECTURE DIAGRAM

Shows the layering of the system with boundaries.

```mermaid
graph TD
    subgraph "Presentation Layer"
        direction LR
        P1[Pages]
        P2[Components]
        P3[Layouts]
    end
    
    subgraph "Application Layer"
        direction LR
        A1[Controllers]
        A2[Services]
        A3[DTOs]
    end
    
    subgraph "Domain Layer"
        direction LR
        D1[Entities]
        D2[Value Objects]
        D3[Aggregates]
        D4[Domain Events]
    end
    
    subgraph "Infrastructure Layer"
        direction LR
        I1[Repository Impl]
        I2[ORM Mapping]
        I3[External APIs]
    end
    
    P1 --> A1
    A1 --> A2
    A2 --> D1
    D1 --> I1
    I1 --> I2
    A2 --> I3
```

---

## 5. DATA FLOW DIAGRAM

Shows how data moves through the system.

```mermaid
flowchart LR
    Input[User Input] --> Validate{Validate}
    Validate -->|Valid| Process[Process Data]
    Validate -->|Invalid| Error[Error Handler]
    Process --> Transform[Transform]
    Transform --> Store[(Database)]
    Transform --> Cache[(Cache)]
    Transform --> Response[API Response]
    Error --> ErrorResponse[Error Response]
    Cache --> Response
```

---

## 6. SEQUENCE DIAGRAM — REQUEST FLOW

Shows the flow of a request through the system.

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant SVC as Service
    participant DB as Database
    
    C->>API: HTTP Request
    API->>Auth: Validate Token
    Auth-->>API: Token Valid
    API->>SVC: Process Request
    SVC->>DB: Query Data
    DB-->>SVC: Result Set
    SVC->>SVC: Business Logic
    SVC-->>API: Response Data
    API-->>C: HTTP Response
```

---

## 7. STATE MACHINE DIAGRAM

Models a system's states and transitions.

```mermaid
stateDiagram-v2
    [*] --> Idle : Initialization
    Idle --> Processing : New Request
    Processing --> Validating : Data Received
    Validating --> Processing : Validation Passed
    Validating --> Error : Validation Failed
    Processing --> Completed : All Steps Done
    Completed --> Idle : Reset
    Error --> Idle : Error Cleared / Retry
```

---

## 8. EXECUTION PATH FLOWCHART

Shows an algorithm or decision process.

```mermaid
flowchart TD
    Start([Start]) --> Check{Is Valid?}
    Check -->|Yes| Load[Load Data]
    Check -->|No| Reject[Reject Request]
    Load --> Transform[Transform Data]
    Transform --> Enrich{Need Enrichment?}
    Enrich -->|Yes| Fetch[Fetch External Data]
    Enrich -->|No| Build[Build Response]
    Fetch --> Build
    Build --> Return([Return Result])
    Reject --> ReturnError([Return Error])
```

---

## 9. CLASS DIAGRAM — COMPONENT STRUCTURE

Shows the structure of a component and its relationships.

```mermaid
classDiagram
    class Service {
        +name: string
        +config: Config
        +start(): void
        +stop(): void
        +process(data: Input): Output
    }
    
    class Config {
        +host: string
        +port: number
        +timeout: number
        +load(): Config
    }
    
    class Repository {
        +find(id: string): Entity
        +save(entity: Entity): void
        +delete(id: string): void
    }
    
    Service --> Config : uses
    Service --> Repository : depends on
    Repository --> Entity : manages
    
    class Entity {
        +id: string
        +createdAt: Date
        +toJSON(): object
    }
```

---

## 10. EVENT FLOW DIAGRAM

Shows event-driven communication between components.

```mermaid
graph LR
    Producer[Event Producer] -->|emit| EventBus[Event Bus]
    EventBus -->|route| Consumer1[Consumer 1]
    EventBus -->|route| Consumer2[Consumer 2]
    EventBus -->|route| Consumer3[Consumer 3]
    
    subgraph "Event Types"
        E1[user.created]
        E2[order.placed]
        E3[payment.received]
    end
    
    EventBus --> E1
    EventBus --> E2
    EventBus --> E3
```

---

## 11. AGENT WORKFLOW DIAGRAM

For AI-agent-based systems — shows how agents interact.

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator Agent
    participant P as Planning Agent
    participant C as Code Agent
    participant T as Tool Executor
    
    U->>O: Task Request
    O->>P: Decompose Task
    P-->>O: Step Plan
    O->>C: Execute Step 1
    C->>T: Call Tool
    T-->>C: Tool Result
    C-->>O: Step Complete
    O->>C: Execute Step 2
    C-->>O: Step Complete
    O-->>U: Final Result
```

---

## 12. DEPLOYMENT TOPOLOGY DIAGRAM

Shows how the system is deployed across infrastructure.

```mermaid
graph TD
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[HAProxy / Nginx]
        end
        
        subgraph "Web Tier"
            W1[Web Server 1]
            W2[Web Server 2]
            W3[Web Server N]
        end
        
        subgraph "Application Tier"
            A1[App Server 1]
            A2[App Server 2]
        end
        
        subgraph "Data Tier"
            DB[(Primary DB)]
            DR[(Read Replica)]
            Cache[(Redis)]
        end
        
        Internet --> LB
        LB --> W1
        LB --> W2
        LB --> W3
        W1 --> A1
        W2 --> A1
        W3 --> A2
        A1 --> DB
        A1 --> DR
        A2 --> DB
        A2 --> DR
        A1 --> Cache
        A2 --> Cache
    end
```

---

## 13. MEMORY/RAG WORKFLOW DIAGRAM

For systems with AI memory and retrieval capabilities.

```mermaid
flowchart LR
    Input[User Query] --> Embed{Generate Embedding}
    Embed --> Vector[Vector Search]
    Embed --> Keyword[Keyword Search]
    Vector --> Hybrid[Hybrid Fusion]
    Keyword --> Hybrid
    Hybrid --> Retrieve[Retrieve Context]
    Retrieve --> Augment[Augment Prompt]
    Augment --> LLM[LLM Generate]
    LLM --> Response[Response]
    
    subgraph "Memory Store"
        VDB[(Vector DB)]
        KDB[(Key-Value Store)]
    end
    
    Vector --> VDB
    Keyword --> KDB
```

---

## DIAGRAM STYLE GUIDE

### Colors
- **System components:** `#e1f5fe` (light blue) or `#bbdefb`
- **External systems:** `#fff3e0` (light orange) or `#ffe0b2`
- **Data stores:** `#f3e5f5` (light purple) or `#e1bee7`
- **User/actors:** `#e8f5e9` (light green) or `#c8e6c9`
- **Error/edge cases:** `#fce4ec` (light red) or `#ffcdd2`

### Node Shapes
- `[Rectangle]` — Standard component, service, module
- `(Rounded)` — External actor, user, external system
- `{Diamond}` — Decision point, conditional branch
- `[(Cylinder)]` — Database, data store
- `[[Stadium]]` — API, interface boundary
- `[/Parallelogram/]` — Input/output, data transformation

### Line Styles
- Solid arrow (`-->`) — Direct call or dependency
- Dotted arrow (`-.->`) — Indirect, dynamic, or async
- Thick arrow (`==>` ) — Data flow, event emission
- Dashed line (`-.-`) — Optional, configuration, or metadata dependency
