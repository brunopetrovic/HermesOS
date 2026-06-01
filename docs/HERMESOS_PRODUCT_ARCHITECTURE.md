# HermesOS Product Architecture & Reference Research

HermesOS is being shaped into a clean, local-first GUI for running and supervising local AI agents such as Hermes Agent, OpenClaw-compatible agents, and custom OpenAI-compatible gateways.

## Non-negotiables

- Do not remove existing app features; optimize and extend them.
- Default install must be clean: no Bruno-specific paths, IPs, credentials, accounts, or hidden assumptions.
- Local-first by default; external exposure must be explicit and authenticated.
- Gateway connection must be visible, testable, and editable from the UI.
- Desktop, tablet, and phone layouts must remain usable.
- Future native app path should support Linux, Windows, and macOS without re-architecting connection state.

## Current Architecture

- Next.js app router, React, TypeScript.
- Local agent connection state is centralized in `src/lib/connection.ts`.
- Connection API:
  - `GET /api/connection` returns masked saved connection plus discovery defaults.
  - `POST /api/connection` validates and saves local gateway config.
  - `DELETE /api/connection` clears saved config.
  - `POST /api/connection/test` probes common local-agent endpoints.
- Hermes data APIs read through the saved connection when available:
  - `/api/hermes/status`
  - `/api/hermes/goals`
  - `/api/hermes/crons`
  - `/api/hermes/memory`
  - `/api/hermes/skills`

## Implemented Foundation

- First-run/local-agent onboarding modal.
- Agent presets for Hermes, OpenClaw-compatible, and custom gateways.
- Local home auto-detection for common Hermes/OpenClaw/custom paths.
- Gateway test flow covering `/health`, `/v1/models`, `/api/health`, `/api/status`, and `/`.
- Header connection pill for always-visible connection state.
- System-status configure action.
- Settings connection panel.
- Cleaned hardcoded native dashboard URL to localhost default.
- Type/lint cleanup for high-noise widget errors.

## Reference Projects — Useful Patterns

### paperclipai/paperclip
- Useful: agent-org metaphor, budget/cost tracking, goal alignment, governance.
- Avoid: heavy enterprise backend/database assumptions for the local GUI.

### pewdiepie-archdaemon/odysseus
- Useful: personal local-first AI workspace simplicity.
- Avoid: unclear licensing/docs; use only high-level inspiration.

### fathah/hermes-desktop
- Useful: Hermes desktop companion, local/remote backend connection, session history, profile/config management.
- Future fit: native shell packaging concepts.

### eigent-ai/eigent
- Useful: specialized multi-agent workforce, local privacy posture, MCP/tool assignment.
- Avoid: coupling HermesOS to CAMEL or another runtime.

### EKKOLearnAI/hermes-web-ui
- Useful: session search, file upload/download, usage analytics, profile-aware UI.
- Avoid: BSL licensing constraints for commercial use; treat as conceptual inspiration only.

### crshdn/mission-control
- Useful: agent orchestration panels, build/test/review/PR pipeline visibility, repo readiness checks.
- Strong fit: mission/workflow cockpit inside HermesOS Nexus.

### crabwise-ai/crabwalk
- Useful: real-time companion monitor, live tool-call/thinking graph, QR/mobile monitor flow, zero-config local detection.
- Strong fit: future live activity graph.

### jontsai/openclaw-command-center
- Useful: secure local dashboard defaults, read-only mode, audit logging, cost/fuel gauges, responsive command center.
- Strong fit: dashboard security posture and operator controls.

### swarmclawai/swarmclaw
- Useful: multi-provider agent runtime concepts, delegation/schedules/swarms, MCP assignment, extension manifest model.
- Strong fit: future multi-agent marketplace/extension system.

### pyrate-llama/hermes-ui
- Useful: single-glass Hermes command center, skills/cron/file/session/job monitoring, keyboard-driven UX.
- Strong fit: Hermes-specific panels and artifact preview patterns.

### Curbob/LobsterBoard
- Useful: drag/drop dashboard widgets, templates, multi-server monitoring.
- Avoid: BSL licensing constraints for commercial use; use as dashboard-builder inspiration only.

## Next Upgrade Tracks

1. **Installer readiness**
   - Add `.env.example` and setup docs for local gateways.
   - Add desktop packaging research spike: Tauri vs Electron vs native wrapper.
   - Add import/export of connection profile minus secrets.

2. **Agent operations cockpit**
   - Session browser and transcript search.
   - Live job/process monitor.
   - Agent fuel gauges: tokens, cost, quota, runtime.
   - Read-only default with explicit control permissions.

3. **Workflow / mission control**
   - Mission pipeline cards: plan → build → test → review → ship.
   - Approval packets for risky actions.
   - Repo readiness checks before agent execution.

4. **Responsive polish**
   - Phone-first onboarding pass.
   - Tablet split-panel optimization.
   - Widget density controls and dashboard templates.

5. **Security/privacy**
   - No secrets displayed in UI.
   - Localhost default, visible warning for non-local gateways.
   - Audit log for future mutation/control actions.
