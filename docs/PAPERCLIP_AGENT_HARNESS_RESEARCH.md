# Paperclip agent harness research for UNOX

Source reviewed: `paperclipai/paperclip` at commit `96feaa33`.
Local research clone: `/home/unc/projects/research/paperclip`.

## Executive take

Paperclip's best idea is not its UI. It is the adapter boundary.

Paperclip treats every agent runtime as data + a narrow execution contract:

- an agent has an `adapter_type`
- adapter-specific configuration lives in JSON
- the control plane invokes a standard `execute(ctx)` shape
- the runtime reports logs, metadata, session state, usage, and status back through a normalized result object
- local CLI agents, HTTP/webhook agents, OpenClaw gateways, and external plugins all fit behind the same adapter registry

UNOX should copy that architectural idea, not Paperclip's whole company/task-management monolith.

## What Paperclip has

### Product/control-plane model

Paperclip is an autonomous-company control plane, not a generic dashboard. Its docs define companies, org charts, agents, issues, goals, costs, approvals, and heartbeat runs. The important pieces for UNOX are:

- `doc/GOAL.md` — control-plane vs execution-services split
- `doc/PRODUCT.md` — “control plane, not execution plane” and “adapter config defines the agent”
- `doc/SPEC-implementation.md` — V1 contract with `adapter_type`, `adapter_config`, heartbeat runs, API keys, budgets, and OpenClaw support

### Monorepo architecture

- `server/` — Express REST API, orchestration services, heartbeat execution
- `ui/` — React + Vite control board
- `packages/db/` — Drizzle schema and migrations
- `packages/shared/` — shared validators/types/constants
- `packages/adapter-utils/` — adapter interfaces and execution result types
- `packages/adapters/` — concrete adapters such as OpenClaw gateway and local CLI adapters
- `server/src/adapters/` — server adapter registry, plugin loader, generic process/http adapters

### Adapter contract

`packages/adapter-utils/src/types.ts` defines the useful core:

- `AdapterAgent` — agent id, company id, adapter type, adapter config
- `AdapterRuntime` — session id/params/display id/task key
- `AdapterExecutionContext` — run id, agent, runtime, config, context, execution target, log callbacks, metadata callbacks, optional auth token
- `AdapterExecutionResult` — exit code, signal, timeout, error, usage, session state, provider/model/billing/cost, runtime services, summary, questions
- `ServerAdapterModule` — adapter module with `type`, `execute`, `testEnvironment`, optional skill sync, models, session management, config schema, runtime command spec

That is the part worth cloning.

### Built-in adapter registry

`server/src/adapters/registry.ts` registers:

- `acpx_local`
- `claude_local`
- `codex_local`
- `cursor`
- `cursor_cloud`
- `gemini_local`
- `grok_local`
- `opencode_local`
- `pi_local`
- `openclaw_gateway`
- `hermes_local`
- generic `process`
- generic `http`

Each adapter declares capabilities like model discovery, local JWT support, instruction bundle support, skill sync, session codec, and runtime command installation/detection.

### Generic process adapter

Files:

- `server/src/adapters/process/index.ts`
- `server/src/adapters/process/execute.ts`

Config shape:

- `command`
- `args`
- `cwd`
- `env`
- `timeoutSec`
- `graceSec`

Pattern: spawn a child process, inject Paperclip environment, stream stdout/stderr through `onLog`, and return normalized result JSON.

UNOX should not auto-run process adapters from setup. Host command execution must be explicit, logged, cancellable, and ideally sandboxed.

### Generic HTTP adapter

Files:

- `server/src/adapters/http/index.ts`
- `server/src/adapters/http/execute.ts`

Config shape:

- `url`
- `method`
- `headers`
- `payloadTemplate`
- `timeoutMs`

Pattern: POST a merged payload `{ ...payloadTemplate, agentId, runId, context }` to an external agent endpoint.

This is a clean fit for UNOX's “other agents” story.

### OpenClaw gateway adapter

File:

- `packages/adapters/openclaw-gateway/src/server/execute.ts`

Important details:

- WebSocket-based gateway client
- request/response/event JSON frames
- device identity with Ed25519 keys
- pairing/challenge-response flow
- session key strategies: `fixed`, `issue`, `run`
- sensitive header/token redaction
- wake payload includes run id, agent id, company id, issue ids, approval ids, wake reason

UNOX should copy the shape eventually, but not rush the whole protocol into this small Next app until it has run objects and explicit execution permissions.

### External adapter plugin loader

Files:

- `server/src/adapters/plugin-loader.ts`
- `server/src/routes/adapters.ts`
- `ui/src/pages/AdapterManager.tsx`

Pattern:

- install adapter package from npm or local path
- dynamically import package entrypoint
- require `createServerAdapter()`
- persist installed adapter metadata
- hot reload via ESM cache-busting URL
- expose adapter inventory over `/api/adapters`
- optionally serve `ui-parser.js` from adapter packages

UNOX should copy the catalog/config side now, not arbitrary dynamic package execution yet. Runtime plugin install is powerful but unsafe without permission gates and sandboxing.

## What UNOX implemented now

This implementation adds a Paperclip-inspired harness registry and upgrades the current single gateway setup into adapter-shaped connection config.

### New files

- `src/lib/agent-harnesses.ts`
  - built-in harness registry
  - adapter types
  - capabilities
  - config field schemas
  - Paperclip-pattern explanations
  - safety notes

- `src/app/api/agent-harnesses/route.ts`
  - read-only harness catalog endpoint

### Updated files

- `src/lib/connection.ts`
  - `AgentType` expanded to `hermes`, `openclaw`, `openai`, `http`, `process`, `custom`
  - saved connection now stores:
    - `adapterType`
    - `connectionMode`
    - `adapterConfig`
    - `capabilities`
  - discovery now returns six harness presets instead of three flat gateway presets
  - gateway probing now uses preset-specific health endpoints

- `src/app/api/connection/route.ts`
  - validates new harness types
  - allows `process://local` as a non-HTTP command harness sentinel
  - persists Paperclip-style adapter config

- `src/app/api/connection/test/route.ts`
  - accepts `agentType`
  - uses the selected harness health endpoints
  - validates local process harness config without executing arbitrary commands

- `src/components/connection/agent-onboarding.tsx`
  - shows the full harness catalog
  - displays adapter type, connection mode, capabilities, and Paperclip pattern
  - adds adapter config JSON editing
  - sends agent type during probes

- `src/components/connection/agent-connection-pill.tsx`
  - supports new harness types/icons

- `src/app/(main)/settings/page.tsx`
  - updates copy to reflect adapter/harness model

## Built-in UNOX harnesses now available

- `hermes_local` — Hermes gateway + optional home sync + future CLI/profile config
- `openclaw_gateway` — OpenClaw/Claw-compatible HTTP gateway
- `openai_compatible_gateway` — Ollama/LM Studio/vLLM/LocalAI/OpenAI-style `/v1` gateways
- `http_webhook` — generic webhook wake endpoint
- `local_process` — local command/script harness config, stored but not auto-executed
- `custom_agent_gateway` — fallback custom gateway

## What not to copy from Paperclip yet

- Do not copy the 10k-line heartbeat service as-is. It mixes scheduling, workspace setup, DB mutation, recovery logic, logging, liveness, and billing.
- Do not execute external npm adapter packages dynamically in the main app yet.
- Do not use browser-side dynamic JS parser imports without a sandbox or declarative parser contract.
- Do not auto-run process harnesses from onboarding. That would be a foot-gun.
- Do not import Paperclip's company/org/task model wholesale into UNOX. UNOX is currently a local agent command center; copy the adapter boundary first.

## Recommended next steps

1. Add a real `runs` model for UNOX: queued/running/succeeded/failed/cancelled, logs, timestamps, adapter type, config snapshot.
2. Add an explicit “Run heartbeat / wake agent” action for `http_webhook` and `local_process`, with confirmation and logs.
3. Add an execution-lock primitive before any autonomous multi-agent task runner.
4. Add an OpenClaw WebSocket gateway implementation only after run records exist.
5. Add adapter config schemas as structured UI fields instead of freeform JSON once the first runtime action exists.
