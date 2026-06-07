import { Command } from "commander";
import { findKnownBot, listKnownBots } from "@avipack/core";

function printBotAction(action: string, botName: string): void {
  const bot = findKnownBot(botName);

  console.log(`Avipack Bot ${action}`);
  console.log("");
  console.log("Status: foundation mode");
  console.log(`Bot: ${bot?.name ?? botName}`);
  console.log("Result: command acknowledged; no installation or file changes performed yet.");
  console.log("Next: bot lifecycle management will be implemented in Phase 2.");
}

export function registerBotCommand(program: Command): void {
  const bot = program.command("bot").description("Manage optional Avipack bot packages.");

  bot
    .command("list")
    .description("List known Avipack bots.")
    .action(() => {
      console.log("Avipack Bot List");
      console.log("");
      console.log("Status: foundation mode");

      for (const knownBot of listKnownBots()) {
        console.log(`- ${knownBot.name} (${knownBot.packageName}): ${knownBot.description}`);
      }
    });

  bot
    .command("add")
    .argument("<bot>", "bot name, id, or package")
    .description("Prepare a bot for installation.")
    .action((botName: string) => printBotAction("Add", botName));

  bot
    .command("enable")
    .argument("<bot>", "bot name, id, or package")
    .description("Enable an installed bot.")
    .action((botName: string) => printBotAction("Enable", botName));

  bot
    .command("disable")
    .argument("<bot>", "bot name, id, or package")
    .description("Disable an installed bot.")
    .action((botName: string) => printBotAction("Disable", botName));

  bot
    .command("run")
    .argument("<bot>", "bot name, id, or package")
    .description("Run a bot manually.")
    .action((botName: string) => printBotAction("Run", botName));
}
