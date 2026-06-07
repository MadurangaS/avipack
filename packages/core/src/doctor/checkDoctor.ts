import { constants, existsSync, accessSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkBrain } from "../brain/checkBrain.js";
import { isAvipackProject, loadConfig } from "../config/loadConfig.js";
import type { AvipackConfig } from "../config/types.js";
import { listKnownBots } from "../plugins/botRegistry.js";

export interface DoctorCheck {
  name: string;
  status: "ok" | "warning" | "error";
  message: string;
}

export interface DoctorResult {
  healthy: boolean;
  cwd: string;
  runtime: {
    node: string;
    platform: string;
    arch: string;
  };
  project: {
    isAvipackProject: boolean;
    hasAvipackDirectory: boolean;
    hasConfig: boolean;
    configParseable: boolean;
    brainFilesOk?: boolean;
    botsOk?: boolean;
    reportsWritable?: boolean;
  };
  checks: DoctorCheck[];
  errors: string[];
  warnings: string[];
}

export function checkDoctor(cwd = process.cwd()): DoctorResult {
  const targetDir = resolve(cwd);
  const checks: DoctorCheck[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const hasAvipackDirectory = existsSync(join(targetDir, ".avipack"));
  const hasConfig = existsSync(join(targetDir, "avipack.config.yaml"));
  const project = isAvipackProject(targetDir);
  let config: AvipackConfig | null = null;
  let configParseable = false;

  addCheck(checks, "Node.js", "ok", process.version);
  addCheck(checks, "Current directory", "ok", targetDir);

  if (!project) {
    addCheck(checks, "Avipack project", "warning", "Current directory is not an Avipack project.");
    warnings.push("Current directory is not an Avipack project.");
  } else {
    addCheck(checks, "Avipack project", "ok", "yes");
  }

  if (!hasAvipackDirectory) {
    addCheck(checks, ".avipack directory", project ? "error" : "warning", "missing");
    (project ? errors : warnings).push(".avipack directory is missing.");
  } else {
    addCheck(checks, ".avipack directory", "ok", "present");
  }

  if (!hasConfig) {
    addCheck(checks, "Config", project ? "error" : "warning", "avipack.config.yaml is missing.");
    (project ? errors : warnings).push("avipack.config.yaml is missing.");
  } else {
    try {
      config = loadConfig(targetDir);
      configParseable = Boolean(config);
      addCheck(checks, "Config", "ok", "parseable");
    } catch (error) {
      addCheck(checks, "Config", "error", error instanceof Error ? error.message : "config parse failed");
      errors.push("avipack.config.yaml is not parseable.");
    }
  }

  const brainFilesOk = project ? checkBrain(targetDir).errors.length === 0 : undefined;
  if (project) {
    addCheck(checks, "Brain files", brainFilesOk ? "ok" : "error", brainFilesOk ? "ok" : "missing or invalid required brain files");
    if (!brainFilesOk) {
      errors.push("Required brain files are missing or invalid.");
    }
  }

  const botsOk = config ? validateBots(config, checks, errors) : undefined;
  const reportsWritable = hasAvipackDirectory ? checkReportsWritable(targetDir, checks, errors) : undefined;

  return {
    healthy: errors.length === 0,
    cwd: targetDir,
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    project: {
      isAvipackProject: project,
      hasAvipackDirectory,
      hasConfig,
      configParseable,
      brainFilesOk,
      botsOk,
      reportsWritable
    },
    checks,
    errors,
    warnings
  };
}

function validateBots(config: AvipackConfig, checks: DoctorCheck[], errors: string[]): boolean {
  const knownBotIds = new Set(listKnownBots().map((bot) => bot.id));
  const invalidBots = [...config.bots.installed, ...config.bots.enabled].filter((botId) => !knownBotIds.has(botId));

  if (invalidBots.length > 0) {
    addCheck(checks, "Bots", "error", `unknown bot ids: ${[...new Set(invalidBots)].join(", ")}`);
    errors.push("Config references unknown bot ids.");
    return false;
  }

  addCheck(checks, "Bots", "ok", "ok");
  return true;
}

function checkReportsWritable(cwd: string, checks: DoctorCheck[], errors: string[]): boolean {
  const reportsDir = join(cwd, ".avipack/reports");
  const writableTarget = existsSync(reportsDir) ? reportsDir : join(cwd, ".avipack");

  try {
    accessSync(writableTarget, constants.W_OK);
    addCheck(checks, "Reports directory", "ok", "writable");
    return true;
  } catch {
    addCheck(checks, "Reports directory", "error", "not writable");
    errors.push("Reports directory is not writable.");
    return false;
  }
}

function addCheck(checks: DoctorCheck[], name: string, status: DoctorCheck["status"], message: string): void {
  checks.push({ name, status, message });
}
