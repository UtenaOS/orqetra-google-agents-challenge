# Orqetra — Teach Once, Run Safely

**Turning human workflows into enterprise AI skills.**

Orqetra is an approval-based execution system that turns human workflows into reusable AI skills.

This repository contains the public challenge demo implementation and documentation for Orqetra’s Google AI Agents Challenge submission. The production Orqetra codebase, internal agents, private logs, credentials, and user data are not included.

## Testing Access

Testing access is available here:

https://orqetra-agents-demo-wowuwwbtrq-uc.a.run.app/demo/google-ai-agents-challenge

The demo runs on Google Cloud Run and exposes only the Google AI Agents Challenge demo route.

## What the Demo Shows

The demo demonstrates the core Orqetra execution contract:

1. A reusable skill contract
2. Runtime-only input binding
3. Preview before execution
4. Explicit human approval
5. Artifact generation only after approval
6. Downloadable Markdown artifact
7. Structured audit logging
8. Private route blocking

## Safety Principles

- Auto Execute: false
- Human approval is required before execution
- Runtime values are not stored in shared skills
- The Cloud Run demo exposes only `/demo/google-ai-agents-challenge`
- Private routes such as `/v1/threads` and `/v1/system/build-info` are blocked
- No production secrets, private logs, or user data are included in this repository

## Google Cloud Usage

This challenge demo uses:

- Google Cloud Run for the public testing access runtime
- Artifact Registry for container images
- Cloud Build for clean container builds
- Cloud Logging for structured audit events
- Agent Platform API / Vertex AI Gemini integration is wired with live status surfaced in the UI

## Confirmed Cloud Logging Events

The demo writes structured audit events such as:

- `orqetra.demo.preview_created`
- `orqetra.demo.run_approved`
- `orqetra.demo.artifact_generated`

## Repository Scope

This is not the full production Orqetra codebase.

This repository is a public challenge demo reference that documents and demonstrates the approval-based execution flow used in the submitted testing access environment.

## Project Status

Cloud Run testing access, preview, approval, artifact generation, download, and Cloud Logging audit events are working.

Agent Platform API / Vertex AI Gemini evaluation is wired and surfaced in the UI. Full successful live evaluation is treated as an optional enhancement.