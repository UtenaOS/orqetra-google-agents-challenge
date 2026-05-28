import { createHash } from "node:crypto";
import { z } from "zod";

export const demoRequestSchema = z.object({
  actorId: z.string().optional().default("devpost-reviewer"),
  ownerUserId: z.string().optional().default("public-demo"),
  sourceUrl: z.string().url(),
  artifactTitle: z.string().min(1).default("Google AI Agents Challenge Submission Pack"),
  outputFormat: z.enum(["markdown", "text"]).default("markdown"),
  saveFolder: z.string().optional().default("Desktop"),
  submissionGoal: z.string().min(1),
  approvalState: z.enum(["preview", "approved"]).default("preview"),
  observedActions: z.array(z.string()).optional().default([]),
});

export function sha256Text(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function redactRuntimeInputValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return `[redacted:${sha256Text(normalized).slice(0, 12)}]`;
}

export function buildGeneralizedSkillContract({ outputFormat }) {
  return {
    representativeSkillGroupId: "google_agents_submission_pack_research_v1",
    skillName: "Research a source URL and create a preparation artifact",
    workflowFamily: "web_research_submission_pack_workflow",
    primitiveChain: [
      "browser_open_url",
      "browser_extract_page_text_safe",
      outputFormat === "markdown" ? "artifact_create_markdown" : "artifact_create_text",
      "artifact_verify_exists",
      "artifact_download_link",
    ],
    requiredInputSchema: [
      { name: "source_url", type: "url", description: "URL to research at runtime" },
      { name: "artifact_title", type: "string", description: "Artifact title supplied at runtime" },
      { name: "submission_goal", type: "string", description: "Goal for the generated preparation memo" },
    ],
    optionalInputSchema: [
      { name: "save_folder", type: "string", description: "Display-only save location" },
      { name: "output_format", type: "enum", values: ["markdown", "text"] },
    ],
    verificationContract: {
      requiredChecks: ["artifact_exists", "required_sections_present", "download_link_created"],
    },
    runtimeRequirements: ["cloud_run", "vertex_ai_gemini_optional", "cloud_logging"],
    safetyPolicy: {
      approvalRequiredBeforeRun: true,
      autoExecute: false,
      blockedPrimitives: ["submit", "send", "purchase", "payment", "delete"],
    },
    valueBoundary: {
      runtimeValuesStoredInSharedSkill: false,
      specificUrlStoredInSharedSkill: false,
      titleStoredInSharedSkill: false,
      saveFolderStoredInSharedSkill: false,
    },
  };
}

export function buildRuntimeInputBinding(input) {
  return {
    semanticRole: "runtime_input_binding",
    sharedSkillIncludesValues: false,
    inputKeys: ["source_url", "artifact_title", "output_format", "save_folder", "submission_goal"],
    redactedValues: {
      source_url: redactRuntimeInputValue(input.sourceUrl),
      artifact_title: redactRuntimeInputValue(input.artifactTitle),
      output_format: input.outputFormat,
      save_folder: redactRuntimeInputValue(input.saveFolder),
      submission_goal: redactRuntimeInputValue(input.submissionGoal),
    },
  };
}

export function buildApprovalPreview(approvalState) {
  return {
    previewAvailable: true,
    approvalRequiredBeforeRun: true,
    autoExecute: false,
    safeToApprove: approvalState === "approved",
    safeToRun: approvalState === "approved",
    riskNotes: [
      "No submit/send/purchase/payment/delete primitive is included.",
      "Runtime values are not stored in the shared skill contract.",
      "Execution requires explicit Run approval.",
    ],
  };
}
