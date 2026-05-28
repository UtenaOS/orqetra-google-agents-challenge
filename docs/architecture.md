# Architecture Overview

## Main Orqetra flow

```text
Start learning
  -> human browser/desktop workflow observation
  -> representative skill candidate
  -> generalized skill contract
  -> runtime input boundary
  -> preview
  -> human approval
  -> artifact
```

The hosted Challenge testing page uses a recorded learning session so judges can test the safe replay path without installing local agents.

## Hosted testing flow

```text
Recorded learning session
  -> generalizedSkillContract
  -> runtimeInputBinding
  -> approvalPreview
  -> approved run
  -> deterministic Markdown artifact
  -> Cloud Logging audit events
```

## Google Cloud

- Cloud Run hosts the demo route.
- Vertex AI Gemini evaluates the generalized skill candidate when enabled.
- Cloud Logging stores structured audit events.
- Artifact Registry stores the demo container image.

## Public reference boundary

This reference implementation mirrors the demo contract. It does not contain the proprietary Orqetra execution core, Windows Agent, Browser Observation extension, private user data, or production credentials.
