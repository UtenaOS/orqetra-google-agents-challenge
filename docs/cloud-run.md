# Cloud Run Notes

The hosted testing demo is deployed to Cloud Run with:

```text
ORQETRA_DEMO_MODE=challenge
ORQETRA_DEMO_VERTEX_ENABLE=1
GOOGLE_CLOUD_PROJECT=orqetra-agents-challenge
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_GEMINI_MODEL=gemini-2.0-flash
```

The service exposes only the Challenge demo routes. Private Orqetra routes such as `/v1/threads`, `/v1/executions`, admin/debug/developer routes, and real run history are not part of this public reference.

## Logs Explorer queries

```text
jsonPayload.eventType="orqetra.demo.preview_created"
jsonPayload.eventType="orqetra.demo.run_approved"
jsonPayload.eventType="orqetra.demo.artifact_generated"
jsonPayload.eventType="orqetra.demo.vertex_evaluated"
```

Fallback text search:

```text
textPayload:"orqetra.demo.preview_created"
textPayload:"orqetra.demo.run_approved"
textPayload:"orqetra.demo.artifact_generated"
textPayload:"orqetra.demo.vertex_evaluated"
```
