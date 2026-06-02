# HermesOS (formerly UNOX)

HermesOS is a universal, clean-install, local-first agent cockpit and operating system. It allows developers and power users to connect their local AI agents (such as Hermes Agent, OpenClaw-compatible agents, and custom OpenAI-compatible gateways) to a premium, unified GUI.

The app is perfectly optimized and highly responsive across **desktop**, **tablet**, and **mobile phone** viewports, preparing it for future native app packaging (Tauri).

## Core Capabilities

- **Zero-Dependency Install**: SQLite-backed local storage (no Docker/Postgres database setup required).
- **Universal Agent Onboarding**: High-fidelity step-by-step wizard to scan, test, and sync with your local agent in under 60 seconds.
- **Operations Cockpit**: Real-time runs monitor, LLM token fuel gauges, live logs viewer, and active session browser.
- **Intelligence Center**: Scheduled crons, visual multi-agent workflow canvases, and declarative agent extension plugin loaders.
- **Brain & Memory Visualizer**: Direct editing of L1 working memory, searchable L2 facts, document intake, and interactive 2D/3D knowledge graphs.

## Prerequisites

- Node.js 20+
- npm 10+
- A running local agent gateway, e.g.:
  - **Hermes Agent** on `http://localhost:8642`
  - **OpenClaw Agent** on `http://localhost:3333`
  - **Ollama / Custom gateway** on `http://localhost:11434`

## Quick Start

Initialize your workspace, set up environment secrets, and bootstrap the local database automatically:

```bash
# Run the setup wizard
npm run setup

# Start the application
npm run dev
```

Open your browser at `http://localhost:3000`.

## Architecture & Configuration

Settings are saved locally inside:
- Configuration file: `~/.unox/connection.json` (Override via `UNOX_CONFIG_DIR`)
- Database: `prisma/dev.db` (SQLite)

For advanced settings, customize `.env.local` based on `.env.example`.
