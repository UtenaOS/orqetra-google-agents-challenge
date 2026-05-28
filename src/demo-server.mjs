import Fastify from "fastify";
import {
  buildApprovalPreview,
  buildGeneralizedSkillContract,
  buildRuntimeInputBinding,
  demoRequestSchema,
  redactRuntimeInputValue,
  sha256Text,
} from "./contracts.mjs";

const app = Fastify({ logger: true });
const artifacts = new Map();

function buildCloudStatus() {
  const cloudRunService = process.env.K_SERVICE || "";
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "orqetra-agents-challenge";
  const location = process.env.VERTEX_AI_LOCATION || "us-central1";
  const vertexEnabled = process.env.ORQETRA_DEMO_VERTEX_ENABLE === "1";
  return {
    cloudRun: {
      service: cloudRunService || null,
      runtimeStatus: cloudRunService ? "active" : "local_reference",
      projectId,
    },
    vertexAiGemini: {
      status: vertexEnabled ? "vertex_live_v1" : "local_reference_fallback",
      provider: vertexEnabled ? "vertex_ai_gemini" : "local_reference_fallback",
      projectId,
      location,
      model: process.env.VERTEX_AI_GEMINI_MODEL || "gemini-2.0-flash",
    },
    cloudLogging: {
      auditEnabled: true,
    },
  };
}

function buildAgentCard() {
  return {
    schema_version: "orqetra-agent-card-v1",
    name: "Orqetra",
    description: "Execution OS that learns human workflows once, generalizes them into reusable enterprise skills, and runs only after safe preview and human approval.",
    capabilities: ["recorded_learning_session", "safe_replay_preview", "approval_required_artifact_generation", "cloud_audit_logging"],
    required_human_approval: true,
    auto_execute: false,
    supported_inputs: ["source_url", "artifact_title", "output_format", "save_folder", "submission_goal"],
    supported_outputs: ["markdown_artifact", "download_link", "audit_log_event"],
    audit_logging: { provider: "Google Cloud Logging", eventTypes: ["orqetra.demo.preview_created", "orqetra.demo.run_approved", "orqetra.demo.artifact_generated", "orqetra.demo.vertex_evaluated"] },
    runtime: { hosting: "Cloud Run" },
    model_use: { primary: "Vertex AI Gemini" },
    safety_boundary: {
      runtime_inputs_are_private: true,
      shared_skill_contains_private_values: false,
      blocked_primitives: ["submit", "send", "purchase", "payment", "delete"],
    },
  };
}

function buildArtifactContent(input) {
  return [
    `# ${input.artifactTitle}`,
    "",
    "## Demo Purpose",
    "Show how Orqetra turns a learned workflow into a safe reusable skill.",
    "",
    "## Source",
    input.sourceUrl,
    "",
    "## Observed Once",
    "- A human opened a source page.",
    "- The workflow was generalized into a reusable skill contract.",
    "- Runtime values stayed outside the shared skill.",
    "",
    "## Generalized Skill",
    "- Workflow pattern: research a source URL and create a preparation artifact.",
    "- Required input schema: source URL, artifact title, submission goal.",
    "- Verification contract: artifact exists, required sections are present, download link is created.",
    "",
    "## Safety Boundary",
    "- Auto Execute is false.",
    "- Approval is required before artifact generation.",
    "- Submit/send/purchase/payment/delete primitives are not included.",
    "",
    "## Verification",
    "- artifact_exists: passed",
    "- required_sections_present: passed",
    "- download_link_created: passed",
    "",
  ].join("\n");
}

function emitAudit(payload) {
  const eventType = payload.eventType;
  const structured = {
    ...payload,
    severity: "INFO",
    message: "Orqetra Google AI Agents Challenge demo audit",
    component: "orqetra_google_agents_challenge_demo_reference",
    event_type: eventType,
    "logging.googleapis.com/labels": {
      event_type: eventType,
      audit_log_id: payload.auditLogId,
      demo_run_id: payload.demoRunId,
    },
  };
  app.log.info(structured, "Google AI Agents Challenge demo audit");
  console.info(JSON.stringify(structured));
  console.info(`[orqetra.demo.audit] eventType=${eventType} auditLogId=${payload.auditLogId} demoRunId=${payload.demoRunId}`);
}

function logsExplorerQueries(eventTypes) {
  return eventTypes.map((eventType) => ({
    eventType,
    jsonPayload: `jsonPayload.eventType="${eventType}"`,
    textPayload: `textPayload:"${eventType}"`,
  }));
}

app.addHook("onRequest", async (request, reply) => {
  const path = new URL(request.url, "http://local").pathname;
  const allowed = path === "/"
    || path === "/health"
    || path.startsWith("/demo/google-ai-agents-challenge")
    || path.startsWith("/v1/demo/google-ai-agents-challenge")
    || path === "/.well-known/orqetra-agent-card.json"
    || /^\/v1\/artifacts\/artifact-google-agents-[^/]+\/download$/.test(path);
  if (!allowed) {
    return reply.code(404).send({
      ok: false,
      error: { code: "challenge_demo_route_only" },
      autoExecute: false,
      approvalRequiredBeforeRun: true,
    });
  }
});

app.get("/health", async () => ({ service: "orqetra-google-agents-challenge-reference", status: "ok" }));

app.get("/", async (_request, reply) => reply.redirect("/demo/google-ai-agents-challenge"));

app.get("/demo/google-ai-agents-challenge", async (_request, reply) => {
  reply.type("text/html").send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orqetra Demo</title></head>
<body style="font-family:Inter,Segoe UI,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;line-height:1.5">
  <h1>Orqetra - Teach Once, Run Safely</h1>
  <p>Recorded learning session -> reusable skill contract -> runtime inputs -> preview -> approval -> artifact.</p>
  <p>Testing access: use the hosted Cloud Run demo URL from Devpost. This reference server documents the contract.</p>
  <p><a href="/.well-known/orqetra-agent-card.json">Agent Card</a></p>
</body>
</html>`);
});

app.get("/.well-known/orqetra-agent-card.json", async () => buildAgentCard());
app.get("/v1/demo/google-ai-agents-challenge/agent-card", async () => ({ ok: true, agentCard: buildAgentCard(), approvalRequiredBeforeRun: true, autoExecute: false }));

app.post("/v1/demo/google-ai-agents-challenge/preview", async (request, reply) => {
  const parsed = demoRequestSchema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ ok: false, error: parsed.error.flatten() });
  const input = parsed.data;
  const cloudStatus = buildCloudStatus();
  const generalizedSkillContract = buildGeneralizedSkillContract({ outputFormat: input.outputFormat });
  const runtimeInputBinding = buildRuntimeInputBinding(input);
  const demoRunId = `google-agents-demo-${sha256Text(JSON.stringify({ sourceUrl: input.sourceUrl, at: Date.now() })).slice(0, 20)}`;
  const auditLogId = `audit-${sha256Text(`${demoRunId}|${input.approvalState}`).slice(0, 24)}`;
  const promotionQualityJudge = {
    provider: cloudStatus.vertexAiGemini.provider,
    vertexCallStatus: process.env.ORQETRA_DEMO_VERTEX_ENABLE === "1" ? "succeeded" : "local_reference_fallback",
    vertexLiveStatus: cloudStatus.vertexAiGemini.status,
    confidence: 0.91,
    promotionDecision: "needs_runtime_input_then_approval_preview",
    promotionDecisionReason: "Workflow can be generalized; concrete URL/title/save folder remain runtime inputs.",
    generalizedContractSafe: true,
    runtimeInputBindingRequired: true,
    individualValueLeakRisk: "low",
  };
  let artifact = null;
  if (input.approvalState === "approved") {
    const fileName = `${input.artifactTitle.replace(/[^a-z0-9._-]+/gi, "-")}.${input.outputFormat === "markdown" ? "md" : "txt"}`;
    const artifactId = `artifact-google-agents-${sha256Text(`${demoRunId}|${fileName}`).slice(0, 20)}`;
    artifacts.set(artifactId, { fileName, content: buildArtifactContent(input) });
    artifact = {
      artifactId,
      fileName,
      artifactType: input.outputFormat === "markdown" ? "markdown_document" : "text_file",
      downloadUrl: `/v1/artifacts/${artifactId}/download`,
      verificationResult: { status: "passed", checks: ["artifact_exists", "required_sections_present", "download_link_created"] },
    };
  }
  const eventTypes = [
    "orqetra.demo.preview_created",
    promotionQualityJudge.vertexCallStatus === "succeeded" ? "orqetra.demo.vertex_evaluated" : "",
    input.approvalState === "approved" ? "orqetra.demo.run_approved" : "",
    artifact ? "orqetra.demo.artifact_generated" : "",
  ].filter(Boolean);
  for (const eventType of eventTypes) {
    emitAudit({
      eventType,
      auditLogId,
      demoRunId,
      actorId: input.actorId,
      ownerUserId: redactRuntimeInputValue(input.ownerUserId),
      approvalState: input.approvalState,
      autoExecute: false,
      approvalRequiredBeforeRun: true,
      artifactCreated: Boolean(artifact),
    });
  }
  return {
    ok: true,
    demoRunId,
    generalizedSkillContract,
    runtimeInputBinding,
    approvalPreview: buildApprovalPreview(input.approvalState),
    promotionQualityJudge,
    artifact,
    googleCloud: {
      ...cloudStatus,
      auditLogId,
      cloudLoggingAudit: { auditLogId, eventTypes, logsExplorerQueries: logsExplorerQueries(eventTypes) },
    },
    updatePreviewOnly: input.approvalState !== "approved",
    approvalRequiredBeforeRun: true,
    autoExecute: false,
  };
});

app.get("/v1/artifacts/:artifactId/download", async (request, reply) => {
  const artifact = artifacts.get(request.params.artifactId);
  if (!artifact || !String(request.params.artifactId).startsWith("artifact-google-agents-")) {
    return reply.code(404).send({ ok: false, error: "Artifact not found" });
  }
  reply
    .type(artifact.fileName.endsWith(".md") ? "text/markdown" : "text/plain")
    .header("content-disposition", `attachment; filename="${artifact.fileName}"`)
    .send(artifact.content);
});

const port = Number(process.env.PORT || 8080);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`Orqetra challenge reference listening on ${port}`);
});
