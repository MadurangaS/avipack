import { Command } from "commander";
import {
  addInstalledBot,
  AvipackProjectRequiredError,
  BotNotEnabledError,
  BotNotInstalledError,
  disableBot,
  enableBot,
  InvalidBotRunModeError,
  listBotsWithState,
  runBot,
  UnknownBotError
} from "@avipack/core";

interface AddBotOptions {
  enable?: boolean;
}

interface RunBotOptions {
  dryRun?: boolean;
  apply?: boolean;
  allowDisabled?: boolean;
}

export function registerBotCommand(program: Command): void {
  const bot = program.command("bot").description("Manage optional Avipack bot packages.");

  bot
    .command("list")
    .description("List known Avipack bots.")
    .action(() => {
      console.log("Avipack Bot List");
      console.log("");

      for (const knownBot of listBotsWithState()) {
        console.log(`- ${knownBot.id}`);
        console.log(`  Name: ${knownBot.name}`);
        console.log(`  Package: ${knownBot.packageName}`);
        console.log(`  Installed: ${knownBot.installed ? "yes" : "no"}`);
        console.log(`  Enabled: ${knownBot.enabled ? "yes" : "no"}`);
        console.log(`  Description: ${knownBot.description}`);
      }
    });

  bot
    .command("add")
    .argument("<bot>", "bot name, id, or package")
    .description("Prepare a bot for installation.")
    .option("--enable", "enable the bot after adding it")
    .action(async (botName: string, options: AddBotOptions) => {
      try {
        const result = await addInstalledBot(botName, { enable: options.enable });
        console.log(formatAddStatus(result.status));
        printBotResult(result.bot.name, result.reportPath);
      } catch (error) {
        printBotError(error);
      }
    });

  bot
    .command("enable")
    .argument("<bot>", "bot name, id, or package")
    .description("Enable an installed bot.")
    .action(async (botName: string) => {
      try {
        const result = await enableBot(botName);
        console.log(result.status === "already-enabled" ? "Avipack bot already enabled." : "Avipack bot enabled.");
        printBotResult(result.bot.name, result.reportPath);
      } catch (error) {
        printBotError(error);
      }
    });

  bot
    .command("disable")
    .argument("<bot>", "bot name, id, or package")
    .description("Disable an installed bot.")
    .action(async (botName: string) => {
      try {
        const result = await disableBot(botName);
        console.log(result.status === "already-disabled" ? "Avipack bot already disabled." : "Avipack bot disabled.");
        printBotResult(result.bot.name, result.reportPath);
      } catch (error) {
        printBotError(error);
      }
    });

  bot
    .command("run")
    .argument("<bot>", "bot name, id, or package")
    .description("Run a bot manually.")
    .option("--dry-run", "show what would happen without writing a report")
    .option("--apply", "write approved .avipack workflow artifacts")
    .option("--allow-disabled", "allow manual run even when the bot is disabled")
    .action(async (botName: string, options: RunBotOptions) => {
      try {
        const result = await runBot(botName, { dryRun: options.dryRun, apply: options.apply, allowDisabled: options.allowDisabled });

        if (result.runResult) {
          printBotRunResult(result.runResult);
        } else {
          console.log("Avipack bot run completed.");
          printBotResult(result.bot.name, result.reportPath);
        }
      } catch (error) {
        printBotError(error);
      }
    });
}

function formatAddStatus(status: string): string {
  switch (status) {
    case "already-installed":
      return "Avipack bot already installed.";
    case "already-installed-enabled":
      return "Avipack bot already installed; enabled by explicit flag.";
    case "already-installed-already-enabled":
      return "Avipack bot already installed and already enabled.";
    default:
      return "Avipack bot added.";
  }
}

function printBotResult(botName: string, reportPath?: string): void {
  console.log("");
  console.log(`Bot: ${botName}`);

  if (reportPath) {
    console.log(`Report: ${reportPath}`);
  }
}

function printBotRunResult(result: {
  botName: string;
  mode: string;
  projectName: string;
  filesInspected: string[];
  findings: string[];
  warnings: string[];
  plannedActions: string[];
  appliedActions: string[];
  filesWritten: string[];
  blockedActions: string[];
  reportPath?: string;
  safetyStatement: string;
}): void {
  console.log("Avipack Bot Run");
  console.log("");
  console.log(`Bot: ${result.botName}`);
  console.log(`Mode: ${result.mode}`);
  console.log(`Project: ${result.projectName}`);
  console.log(`Files inspected: ${result.filesInspected.length}`);
  console.log(`Findings: ${result.findings.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Planned actions: ${result.plannedActions.length}`);
  console.log(`Applied actions: ${result.appliedActions.length}`);
  console.log(`Files written: ${result.filesWritten.length}`);

  if (result.filesWritten.length > 0) {
    console.log("Files:");
    for (const file of result.filesWritten) {
      console.log(`  - ${file}`);
    }
  }

  if (result.reportPath) {
    console.log(`Report: ${result.reportPath}`);
  }

  if (result.blockedActions.length > 0) {
    console.log("Blocked actions:");
    for (const action of result.blockedActions) {
      console.log(`  - ${action}`);
    }
  }

  console.log(`Safety: ${result.safetyStatement}`);
}

function printBotError(error: unknown): void {
  if (
    error instanceof UnknownBotError ||
    error instanceof AvipackProjectRequiredError ||
    error instanceof BotNotInstalledError ||
    error instanceof BotNotEnabledError ||
    error instanceof InvalidBotRunModeError
  ) {
    console.error(error.message);
  } else {
    console.error(error instanceof Error ? error.message : "Bot command failed.");
  }

  process.exitCode = 1;
}
