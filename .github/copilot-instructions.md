<!--
Purpose: Short, actionable instructions for automated coding agents (Copilot-style) working in the AuraOS-Monorepo.
Keep it focused on what is discoverable in this repository and the attached analysis documents.
-->
# Copilot instructions — AuraOS-Monorepo (quick start)

This repo currently holds analysis and valuation artifacts for a planned AuraOS monorepo. Use the files below as the single source of truth for architecture, workflows and integration examples:

- `OS_COMPONENTS_ANALYSIS.md` — architecture, component mapping, build & integration examples.
- `REPOSITORY_VALUATION_REPORT.md` — portfolio, priorities, suggested product strategy.
- `.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile` — recommended development environment.

Keep guidance concise: only implement changes that can be validated locally (build/tests) and do not require secrets or external cloud credentials.

## Big-picture architecture (what to read first)
- The repo is a proposed monorepo that will aggregate several existing projects (SelfOS, AIOS, auraos, BASIC-M6502). The high-level package layout is described in `OS_COMPONENTS_ANALYSIS.md` (packages/, apps/, services/, tools/).
- Major boundaries (from analysis):
  - UI (React + Vite + TypeScript) in `packages/ui` / `apps/desktop` (planned)
  - Core runtime/emulator in `packages/core` (6502 emulator, BASIC interpreter)
  - AI / bridge services in `services/api` or `packages/core/bridge` (FastAPI / Node.js)
  - Automation/workflows in `packages/automation` (auraos components)

Read `OS_COMPONENTS_ANALYSIS.md` before making cross-package changes — it contains proven integration commands (git subtree, copy patterns) and an initial monorepo layout example.

## Developer workflows (explicit, reproducible steps)
- Use the devcontainer to get a consistent environment. Open the repository in a compatible editor and start the container using `.devcontainer/devcontainer.json` (base: ubuntu-24.04).
- Monorepo package manager: the analysis recommends pnpm workspaces. Example pnpm-workspace.yaml snippet is in `OS_COMPONENTS_ANALYSIS.md`.
- Common commands (from the analysis file and typical monorepo setup):
  - Initialize workspace and install: `pnpm install` (run inside the devcontainer)
  - Build all packages: `pnpm -r build`
  - Run all tests: `pnpm -r test`
  - Start development: `pnpm dev` or filter: `pnpm --filter <pkg> dev`

If you introduce Python services (FastAPI) run `pytest` in that service folder. If you introduce Node/TS services, use the workspace test/build commands.

## Project-specific conventions and patterns (discoverable)
- TypeScript + React UI: Vite + Tailwind + Framer Motion are the preferred stack in the analysis. Look for `ui/` and `client/` folders when they appear.
- State management: Zustand is used in examples; follow that pattern for new UI stores.
- Backend: Python FastAPI for bridge services; WebSocket is used for real-time communication between UI and bridge (see analysis references to `bridge/` and `bridge/ai/`).
- CI/quality: the analysis references ESLint, Prettier, SonarQube — add configs at repo root when stabilizing.

## Integration points & external dependencies (what an agent must know)
- Remote source repos to integrate (analysis lists these):
  - `https://github.com/Moeabdelaziz007/SelfOS` (emulator, UI, bridge)
  - `https://github.com/Moeabdelaziz007/AIOS` (firebase + frontend)
  - `https://github.com/Moeabdelaziz007/auraos` (automation engine)
  - `https://github.com/Moeabdelaziz007/BASIC-M6502` (interpreter)
- Example integration command (from `OS_COMPONENTS_ANALYSIS.md`):
  - `git subtree add --prefix=temp/selfos https://github.com/Moeabdelaziz007/SelfOS.git main --squash`
  - Use `temp/` as a staging area, then move components into `packages/` or `services/`.
- Cloud & infra: Firebase is referenced for auth and data. Do not attempt to run Firebase-hosted components without credentials — mock or stub them in tests.

## What success looks like for small tasks
- Minimal PR examples an AI agent can open:
  1. Add `pnpm-workspace.yaml` and a minimal `packages/example` package with build/test scripts that run in the devcontainer.
  2. Create `scripts/integrate-components.sh` (idempotent, non-destructive) that copies subtrees from `temp/` into the `packages/` layout (see script example in `OS_COMPONENTS_ANALYSIS.md`).
  3. Add repo-level ESLint/Prettier configs and a `README.md` scaffold referencing `OS_COMPONENTS_ANALYSIS.md`.

When adding code, include a smoke test and run the appropriate build/test command before opening a PR.

## Small contract for AI edits
- Inputs: changed files in this repo (no external secrets), new or updated scripts, sample packages.
- Outputs: buildable packages (locally), green unit tests for new code added, no leaking of credentials.
- Error modes: large repository imports (use shallow/squash or staged copy), missing CI configs (add minimal ones), non-deterministic tests (pin dependencies).

## Quick checklist for PRs
- Is there an entry in `OS_COMPONENTS_ANALYSIS.md` that this change implements or updates? If not, add a one-line rationale.
- Does the code build with `pnpm -r build` (or service-specific `pytest`)? Run locally in devcontainer.
- Are there any credentials or secrets? If yes, remove them and replace with env var placeholders and a `.env.example`.
- Add or update a short test/smoke test that demonstrates the new behavior.

## Where to look next (key files)
- `OS_COMPONENTS_ANALYSIS.md` — architecture, commands and examples (first stop).
- `REPOSITORY_VALUATION_REPORT.md` — priorities, recommended roadmap.
- `.devcontainer/devcontainer.json` and `Dockerfile` — environment and tools.

If any part of the architecture is unclear, or you want me to convert the `OS_COMPONENTS_ANALYSIS.md` plan into an initial monorepo scaffold (pnpm-workspace, placeholder packages, CI), tell me which Phase (1..5) to start with and I will implement it and run the build/tests in the devcontainer.

---
Please review these instructions and tell me which next task you'd like automated (create pnpm-workspace + minimal packages, add the integrate script, or import a specific upstream repo into `temp/` for review).
