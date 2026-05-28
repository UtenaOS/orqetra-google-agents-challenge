# Orqetra - Teach Once, Run Safely

Turning human workflows into enterprise AI skills.

This folder is the public Google AI Agents Challenge reference package for Orqetra. It is designed to be copied into the public `orqetra-google-agents-challenge` repository.

It intentionally does **not** include the proprietary Orqetra execution core, Windows Agent, Browser Observation extension, production configs, secrets, private logs, or user data.

## Testing access

Hosted Cloud Run demo:

```text
https://orqetra-agents-demo-wowuwwbtrq-uc.a.run.app/demo/google-ai-agents-challenge
```

The hosted page lets judges test the safe replay flow without installing the Windows Agent or Browser Observation extension:

1. Keep the sample inputs or edit them.
2. Click `Create Preview`.
3. Confirm no artifact is created during preview.
4. Click `Approve Run & Generate Artifact`.
5. Download the deterministic Markdown artifact.

## What this reference shows

- `generalizedSkillContract`: the reusable skill shape.
- `runtimeInputBinding`: per-run values that are not stored in the shared skill.
- `approvalPreview`: execution preview with `autoExecute:false`.
- Approved artifact generation.
- Structured Cloud Logging audit events.
- Demo-only route protection for Cloud Run.
- Agent Card example for marketplace/readiness discussion.

## Google Cloud usage

- Cloud Run hosts the demo service.
- Vertex AI Gemini evaluates the generalized skill candidate when enabled.
- Cloud Logging stores audit events:
  - `orqetra.demo.preview_created`
  - `orqetra.demo.run_approved`
  - `orqetra.demo.artifact_generated`
  - `orqetra.demo.vertex_evaluated`

## Repository boundary

Do not commit:

- `.env`
- Supabase keys
- Google credentials
- production configs
- private logs
- raw observation logs
- real user data
- raw URLs from private users
- file paths
- clipboard content
- proprietary Orqetra core code
- Windows Agent source
- Browser Observation source

## Files

```text
src/demo-server.mjs                 Minimal public reference implementation
src/contracts.mjs                   Public demo contracts
samples/agent-card.example.json     Agent Card example
samples/sample-audit-log.json       Cloud Logging event example
samples/sample-preview-response.json Preview response example
docs/architecture.md                Architecture overview
docs/safety-boundary.md             Safety boundary
docs/cloud-run.md                   Cloud Run deployment notes
Dockerfile                          Minimal reference Dockerfile
cloudbuild.yaml                     Cloud Build example
```

## Local reference run

```bash
npm install
npm start
```

Then open:

```text
http://localhost:8080/demo/google-ai-agents-challenge
```

This reference implementation is deterministic and intentionally small. The hosted Orqetra demo uses the production execution OS contract with the same safety boundary.
