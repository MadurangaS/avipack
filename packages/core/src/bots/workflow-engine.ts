import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { AvipackConfig } from "../config/types.js";
import type { BotManifest } from "../plugins/botManifest.js";
import { describeBotPermissions } from "./botPermissions.js";
import { inspectDirectory, parseOptionalYaml, summarizePath, timestampedArtifactPath } from "./bot-inspection.js";
import type { BotRunMode, BotRunResult } from "./bot-run-result.js";
import { validateSafeBotWritePath } from "./safe-bot-writes.js";

const inspectedPaths = [
  ".avipack/brain/project.yaml",
  ".avipack/brain/requirements.yaml",
  ".avipack/brain/architecture.yaml",
  ".avipack/brain/testing-strategy.yaml",
  ".avipack/brain/security-rules.yaml",
  ".avipack/brain/glossary.yaml",
  ".avipack/brain/sprint-lock.yaml",
  ".avipack/changes",
  ".avipack/decisions"
];

export interface RunBotWorkflowOptions {
  cwd: string;
  bot: BotManifest;
  config: AvipackConfig;
  mode: BotRunMode;
  timestamp?: string;
}

export async function runBotWorkflow(options: RunBotWorkflowOptions): Promise<BotRunResult> {
  const timestamp = options.timestamp ?? new Date().toISOString();
  const filesInspected = await inspectProject(options.cwd);
  const findings = createFindings(filesInspected);
  const warnings = await createWarnings(options.cwd);
  const plannedActions = createPlannedActions(options.bot, options.mode);
  const blockedActions = [
    "Application source-code modification is blocked in Phase 2A.",
    "External AI provider calls are blocked in Phase 2A.",
    "Package installation during bot runs is blocked in Phase 2A.",
    "Background or autonomous bot execution is blocked in Phase 2A."
  ];
  const safetyStatement = "Bot run was manual, local, permission-scoped, and limited to approved .avipack artifacts.";
  const appliedActions: string[] = [];
  const filesWritten: string[] = [];
  let reportPath: string | undefined;

  const result: BotRunResult = {
    botId: options.bot.id,
    botName: options.bot.name,
    timestamp,
    projectName: options.config.project.name,
    mode: options.mode,
    filesInspected,
    findings,
    warnings,
    plannedActions,
    appliedActions,
    filesWritten,
    blockedActions,
    safetyStatement
  };

  if (options.mode === "dry-run") {
    return result;
  }

  reportPath = timestampedArtifactPath(".avipack/reports/bots", `run-${shortBotId(options.bot)}`, timestamp);
  appliedActions.push("Created bot run report.");
  filesWritten.push(reportPath);

  let artifactPath: string | undefined;
  if (options.mode === "apply") {
    artifactPath = timestampedArtifactPath(".avipack/drafts", `${shortBotId(options.bot)}-workflow`, timestamp);
    appliedActions.push("Created approved .avipack workflow draft.");
    filesWritten.push(artifactPath);
  }

  const completedResult = {
    ...result,
    appliedActions,
    filesWritten,
    reportPath
  };

  await writeSafeBotArtifact(options.cwd, reportPath, renderBotRunReport(completedResult, options.bot));

  if (artifactPath) {
    await writeSafeBotArtifact(options.cwd, artifactPath, renderGenericWorkflowDraft(completedResult));
  }

  return completedResult;
}

export async function writeSafeBotArtifact(cwd: string, relativePath: string, content: string): Promise<string> {
  const validation = validateSafeBotWritePath(cwd, relativePath);
  if (!validation.ok || !validation.absolutePath || !validation.relativePath) {
    throw new Error(validation.reason ?? `Unsafe bot write path: ${relativePath}`);
  }

  await mkdir(dirname(validation.absolutePath), { recursive: true });
  await writeFile(validation.absolutePath, content);
  return validation.relativePath;
}

async function inspectProject(cwd: string): Promise<string[]> {
  const summaries = await Promise.all(inspectedPaths.map((path) => summarizePath(cwd, path)));
  const present = summaries.filter((summary) => summary.exists).map((summary) => summary.path);
  const changes = await inspectDirectory(cwd, ".avipack/changes");
  const decisions = await inspectDirectory(cwd, ".avipack/decisions");
  return [...present, ...changes, ...decisions].sort();
}

function createFindings(filesInspected: string[]): string[] {
  const findings = ["Bot workflow engine completed local project inspection."];
  if (filesInspected.some((file) => file.startsWith(".avipack/brain/"))) {
    findings.push("Avipack brain files are present for workflow context.");
  }
  if (filesInspected.includes(".avipack/changes")) {
    findings.push("Change request directory is available for governance context.");
  }
  if (filesInspected.includes(".avipack/decisions")) {
    findings.push("Decision record directory is available for architecture context.");
  }
  return findings;
}

async function createWarnings(cwd: string): Promise<string[]> {
  const warnings: string[] = [];
  const project = await parseOptionalYaml(cwd, ".avipack/brain/project.yaml");
  const requirements = await parseOptionalYaml(cwd, ".avipack/brain/requirements.yaml");

  if (!project) {
    warnings.push("Project metadata was not available during bot inspection.");
  }
  if (!requirements) {
    warnings.push("Requirements were not available during bot inspection.");
  }

  return warnings;
}

function createPlannedActions(bot: BotManifest, mode: BotRunMode): string[] {
  const actions = [
    "Inspect Avipack brain and governance directories.",
    "Return structured bot run result with findings, warnings, blocked actions, and safety statement."
  ];

  if (mode === "dry-run") {
    actions.push("Dry-run only: no files will be written.");
    actions.push("Would create a bot run report in report/apply mode.");
    actions.push("Would create an approved .avipack workflow draft in apply mode.");
    return actions;
  }

  actions.push("Create bot run report under .avipack/reports/bots/.");
  if (mode === "apply") {
    actions.push(`Create approved .avipack workflow draft for ${bot.name}.`);
  }
  return actions;
}

function renderBotRunReport(result: BotRunResult, bot: BotManifest): string {
  return `# Avipack Bot Run Report

## Bot
- ID: ${result.botId}
- Name: ${result.botName}
- Mode: ${result.mode}
- Project: ${result.projectName}
- Timestamp: ${result.timestamp}

## Summary
- Files inspected: ${result.filesInspected.length}
- Findings: ${result.findings.length}
- Warnings: ${result.warnings.length}
- Planned actions: ${result.plannedActions.length}
- Applied actions: ${result.appliedActions.length}
- Files written: ${result.filesWritten.length}

## Files Inspected
${renderList(result.filesInspected)}

## Findings
${renderList(result.findings)}

## Warnings
${renderList(result.warnings)}

## Planned Actions
${renderList(result.plannedActions)}

## Applied Actions
${renderList(result.appliedActions)}

## Blocked Actions
${renderList(result.blockedActions)}

## Permissions
${describeBotPermissions(bot)}

## Safety
${result.safetyStatement}
`;
}

function renderGenericWorkflowDraft(result: BotRunResult): string {
  return `# ${result.botName} Workflow Draft

Generated: ${result.timestamp}
Mode: ${result.mode}
Project: ${result.projectName}

## Purpose
This generic Phase 2A artifact proves safe .avipack write handling for controlled bot workflows. Bot-specific intelligence will be added in later workflow prompts.

## Planned Actions
${renderList(result.plannedActions)}

## Safety
${result.safetyStatement}
`;
}

function renderList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function shortBotId(bot: BotManifest): string {
  return bot.id.split(".").at(-1) ?? bot.id;
}
