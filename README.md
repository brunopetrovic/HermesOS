# UNOX

UNOX is a local-first agent command center for connecting to and operating AI agents such as Hermes Agent, OpenClaw-compatible agents, and custom OpenAI-compatible gateways.

The goal is simple: install the GUI, connect your local agent gateway, then use one responsive desktop/tablet/mobile interface to monitor status, memory, skills, cron jobs, goals, sessions, workflows, and future agent-control tools.

## Current status

UNOX is a Next.js app today and is being prepared for native Linux, Windows, and macOS packaging later.

- Local-first by default
- No required cloud provider
- No secrets shown in the UI
- Connection onboarding built into the app
- Hermes Agent, OpenClaw-compatible, and custom gateway presets
- Desktop/tablet/mobile responsive shell

## Requirements

- Node.js 22+
- npm 10+
- A local agent gateway, for example:
  - Hermes Agent gateway on `http://localhost:8642`
  - OpenClaw-compatible HTTP gateway/dashboard
  - Custom OpenAI-compatible local gateway

## Install

```bash
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

For a production build:

```bash
npm run build
npm run start
```

## First-run onboarding

On first launch, UNOX opens the local agent setup flow.

You can configure:

- Agent type: `Hermes Agent`, `OpenClaw / Claw-compatible`, or `Custom`
- Display label
- Gateway URL
- Optional bearer token / API key
- Optional local agent home path

The connection is saved locally in:

```text
~/.unox/connection.json
```

Set `UNOX_CONFIG_DIR` to store that file somewhere else.

## Environment variables

UNOX can also read connection defaults from environment variables. Start by copying the example file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` as needed:

```bash
HERMES_GATEWAY_URL=http://localhost:8642
HERMES_HOME=~/.hermes
HERMES_API_KEY=

OPENCLAW_GATEWAY_URL=http://localhost:3333
OPENCLAW_WORKSPACE=~/.openclaw-workspace
OPENCLAW_API_KEY=

AGENT_TYPE=custom
AGENT_GATEWAY_URL=http://localhost:11434
AGENT_HOME=~/.agent
AGENT_API_KEY=
```

Saved onboarding config takes priority over environment defaults.

## Gateway probing

The onboarding tester checks common local-agent endpoints:

- `/health`
- `/v1/models`
- `/api/health`
- `/api/status`
- `/`

A gateway-only connection is enough for basic reachability. Providing a home path unlocks richer local file-backed panels such as status, memory, skills, crons, and sessions.

## Development commands

```bash
npm run lint
npm run build
```

Current lint policy: errors should stay at zero. Warnings are tracked cleanup debt.

## Architecture notes

See:

```text
docs/UNOX_PRODUCT_ARCHITECTURE.md
```
