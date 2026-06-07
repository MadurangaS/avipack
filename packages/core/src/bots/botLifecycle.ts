import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { isAvipackProject, loadConfig, writeConfig } from "../config/loadConfig.js";
import type { AvipackConfig } from "../config/types.js";
import type { BotManifest } from "../plugins/botManifest.js";
import { findKnownBot, listKnownBots } from "../plugins/botRegistry.js";
import { canWriteBotReport, describeBotPermissions } from "./botPermissions.js";

export type BotState = {
  installed: string[];
  enabled: string[];
};

export type BotActionResult = {
  bot: BotManifest;
  status: "added" | "already-installed" | "enabled" | "already-enabled" | "disabled" | "already-disabled" | "ran" | "dry-run";
  config?: AvipackConfig;
  reportPath?: string;
};

export class UnknownBotError extends Error {
  constructor(input: string) {
    super(`Unknown Avipack bot: ${input}`);
    this.name = "UnknownBotError";
  }
}

export class AvipackProjectRequiredError extends Error {
  constructor() {
    super("This command must be run from an Avipack project.");
    this.name = "AvipackProjectRequiredError";
  }
}

export class BotNotInstalledError extends Error {
  constructor(bot: BotManifest) {
    super(`${bot.name} is not installed in this project.`);
    this.name = "BotNotInstalledError";
  }
}

export class BotNotEnabledError extends Error {
  constructor(bot: BotManifest) {
    super(`${bot.name} is not enabled in this project.`);
    this.name = "BotNotEnabledError";
  }
}

export function resolveKnownBot(input: string): BotManifest | undefined {
  return findKnownBot(input);
}

export function requireKnownBot(input: string): BotManifest {
  const bot = resolveKnownBot(input);

  if (!bot) {
    throw new UnknownBotError(input);
  }

  return bot;
}

export function getBotState(cwd = process.cwd()): BotState {
  const config = requireProjectConfig(cwd);
  return {
    installed: config.bots.installed,
    enabled: config.bots.enabled
  };
}

export async function addInstalledBot(input: string, options: { cwd?: string; enable?: boolean } = {}): Promise<BotActionResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const bot = requireKnownBot(input);
  const config = requireProjectConfig(cwd);

  if (config.bots.installed.includes(bot.id)) {
    return { bot, status: "already-installed", config };
  }

  config.bots.installed.push(bot.id);

  if (options.enable && !config.bots.enabled.includes(bot.id)) {
    config.bots.enabled.push(bot.id);
  }

  await writeConfig(cwd, config);
  const reportPath = await writeBotAuditReport(cwd, bot, "add", `Recorded ${bot.name} as installed for this project.${options.enable ? " It was also enabled by explicit flag." : ""}`);
  return { bot, status: "added", config, reportPath };
}

export async function enableBot(input: string, options: { cwd?: string } = {}): Promise<BotActionResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const bot = requireKnownBot(input);
  const config = requireProjectConfig(cwd);

  if (!config.bots.installed.includes(bot.id)) {
    throw new BotNotInstalledError(bot);
  }

  if (config.bots.enabled.includes(bot.id)) {
    return { bot, status: "already-enabled", config };
  }

  config.bots.enabled.push(bot.id);
  await writeConfig(cwd, config);
  const reportPath = await writeBotAuditReport(cwd, bot, "enable", `Enabled ${bot.name} for manual project-local execution.`);
  return { bot, status: "enabled", config, reportPath };
}

export async function disableBot(input: string, options: { cwd?: string } = {}): Promise<BotActionResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const bot = requireKnownBot(input);
  const config = requireProjectConfig(cwd);

  if (!config.bots.enabled.includes(bot.id)) {
    return { bot, status: "already-disabled", config };
  }

  config.bots.enabled = config.bots.enabled.filter((enabledBot) => enabledBot !== bot.id);
  await writeConfig(cwd, config);
  const reportPath = await writeBotAuditReport(cwd, bot, "disable", `Disabled ${bot.name}. It remains installed in project config.`);
  return { bot, status: "disabled", config, reportPath };
}

export function canRunBot(input: string, options: { cwd?: string; allowDisabled?: boolean } = {}): BotManifest {
  const cwd = resolve(options.cwd ?? process.cwd());
  const bot = requireKnownBot(input);
  const config = requireProjectConfig(cwd);

  if (!config.bots.installed.includes(bot.id)) {
    throw new BotNotInstalledError(bot);
  }

  if (!options.allowDisabled && !config.bots.enabled.includes(bot.id)) {
    throw new BotNotEnabledError(bot);
  }

  return bot;
}

export async function runBot(input: string, options: { cwd?: string; dryRun?: boolean; allowDisabled?: boolean } = {}): Promise<BotActionResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const bot = canRunBot(input, { cwd, allowDisabled: options.allowDisabled });

  if (options.dryRun) {
    return { bot, status: "dry-run" };
  }

  const reportPath = await writeBotExecutionReport(cwd, bot);
  return { bot, status: "ran", reportPath };
}

export function listBotsWithState(cwd = process.cwd()): Array<BotManifest & { installed: boolean; enabled: boolean }> {
  const config = isAvipackProject(cwd) ? loadConfig(cwd) : null;
  const installed = new Set(config?.bots.installed ?? []);
  const enabled = new Set(config?.bots.enabled ?? []);

  return listKnownBots().map((bot) => ({
    ...bot,
    installed: installed.has(bot.id),
    enabled: enabled.has(bot.id)
  }));
}

function requireProjectConfig(cwd: string): AvipackConfig {
  if (!isAvipackProject(cwd)) {
    throw new AvipackProjectRequiredError();
  }

  const config = loadConfig(cwd);

  if (!config) {
    throw new AvipackProjectRequiredError();
  }

  return config;
}

async function writeBotAuditReport(cwd: string, bot: BotManifest, action: string, summary: string): Promise<string> {
  const reportPath = `.avipack/reports/bots/${timestamp()}-${action}-${shortBotId(bot)}.md`;
  const absolutePath = join(cwd, reportPath);

  if (!canWriteBotReport(cwd, reportPath)) {
    throw new Error(`Refusing to write bot report outside .avipack/reports: ${reportPath}`);
  }

  await mkdir(join(cwd, ".avipack/reports/bots"), { recursive: true });
  await writeFile(
    absolutePath,
    `# Avipack Bot ${titleCase(action)} Report

## Bot
- ID: ${bot.id}
- Name: ${bot.name}
- Package: ${bot.packageName}

## Action
- Type: ${action}
- Timestamp: ${new Date().toISOString()}
- Summary: ${summary}

## Safety
- Bot actions are owner-controlled and manual.
- No application source files were modified.
- No package installation was performed in this MVP.
`
  );

  return reportPath;
}

async function writeBotExecutionReport(cwd: string, bot: BotManifest): Promise<string> {
  const reportPath = `.avipack/reports/bots/${timestamp()}-run-${shortBotId(bot)}.md`;
  const absolutePath = join(cwd, reportPath);

  if (!canWriteBotReport(cwd, reportPath)) {
    throw new Error(`Refusing to write bot report outside .avipack/reports: ${reportPath}`);
  }

  await mkdir(join(cwd, ".avipack/reports/bots"), { recursive: true });
  await writeFile(
    absolutePath,
    `# Avipack Bot Execution Report

## Bot
- ID: ${bot.id}
- Name: ${bot.name}
- Package: ${bot.packageName}
- Timestamp: ${new Date().toISOString()}

## Permissions
${describeBotPermissions(bot)}

## Status
completed

## Files Inspected or Intended Scope
- ${bot.permissions.read.join("\n- ")}

## Current MVP Result
This milestone records a manual bot run report only. It does not perform AI analysis, call external APIs, install packages, or modify application source files.

## Next Recommended Human Action
Review this report and decide whether a future scoped bot implementation should be added for ${bot.name}.
`
  );

  return reportPath;
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function shortBotId(bot: BotManifest): string {
  return bot.id.split(".").at(-1) ?? bot.id;
}

function titleCase(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
