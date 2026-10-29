# Threat Model: Mini Shop

Scope: Local HTTP service, SQLite in-memory DB, temporary sandboxed files. Users: customers (alice, bob) and staff. AI assistant exposes context and tools.

Assets
- Customer PII in profiles
- Order data and receipts in sandbox files
- Staff-only data (export, logs, private/operator-note.txt)

Trust Boundaries
- HTTP request boundary (untrusted input)
- Auth session (X-Token -> server session map)
- Filesystem sandbox (sandbox.root)
- AI assistant boundary (model output -> executor)

Threats and Mitigations
- SQL injection via /profile, /search: Use parameterized queries; ignore client-provided IDs for own data
- IDOR on /profile, /orders, /files, /assistant/context: Bind to session identity; staff override; validate filenames
- Privilege escalation via X-Role header and assistant tools: Authorize by session role only; enforce per-tool checks
- Price tampering on /orders: Ignore client price; use catalog price
- XSS in /reviews/view: HTML-escape review text
- Sensitive data leakage via /debug/logs: Staff-only; redact X-Token
- Unsafe assistant execution: Constrain read_file to own receipt; restrict delete_tree to files/ for staff only; export_profiles staff-only
- Path traversal: sandbox.py enforces physical boundary; app enforces logical policy per user

Residual Risks
- Staff can still delete files/ tree (intended capability). Sandbox prevents escaping.
- Model prompt injection mitigated by executor restrictions; system prompt adds guidance but executor remains primary control.

Validation
- Unit tests and HTTP tests cover normal flows; added checks for access controls and escaping; run make test.

## Mermaid Diagram (System Context & Controls)

```mermaid
flowchart TB

  subgraph Client
    U[User]
    LLM[LLM Planner - no tools]
  end

  subgraph Service
    H[HTTP Handler]
    S[Business Logic]
    EXEC[Assistant Executor]
  end

  subgraph DataStores
    DB[(SQLite)]
    FS[(Sandbox files root)]
  end

  U -->|HTTP requests| H
  H --> S
  S --> DB
  S --> FS
  S --> EXEC
  LLM -->|decision JSON| EXEC

  EXEC -->|read_file| FS
  EXEC -->|export_profiles| DB
  EXEC -->|delete_tree| FS

  %% Threats (attack surface)
  H -- SQL injection --> S
  S -- IDOR profile/orders/files --> DB
  S -- XSS via reviews/view --> H
  S -- Token leakage in logs --> H
  EXEC -- Tool abuse read/export/delete --> FS
  EXEC -- Tool abuse export --> DB

  %% Mitigations (key controls)
  S -. Param queries, session-bound IDs .-> DB
  S -. HTML-escape reviews .-> H
  S -. Staff-only authorization .-> DB
  S -. Enforce catalog price .-> DB
  EXEC -. Allowlist paths & roles .-> FS
  EXEC -. Staff-only tools .-> DB
  H -. Redact sensitive headers .-> S
```

## Mermaid Diagram (Trust Boundaries)

```mermaid
flowchart LR
  subgraph Client
    C1[Browser/User]
    C2[LLM Planner]
  end

  subgraph Service
    B1[HTTP Handler]
    B2[Business Logic]
    B3[Assistant Executor]
  end

  subgraph Data
    D1[(SQLite)]
    D2[(Sandbox FS)]
  end

  C1 --> B1 --> B2 --> D1
  B2 --> D2
  C2 --> B3
  B3 --> D1
  B3 --> D2

  %% Controls per boundary crossing
  B1 -- validate sizes, content-type, redact logs --> B2
  B2 -- authZ by session, param SQL, HTML escape --> D1
  B2 -- per-user path policy --> D2
  B3 -- tool allowlist + role checks --> D1
  B3 -- path allowlist files/user/receipt.txt and files/* for staff delete --> D2
```
