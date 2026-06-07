#!/usr/bin/env node
import { Command } from "commander";
import { registerAdrCommand } from "./commands/adr.js";
import { registerAdoptCommand } from "./commands/adopt.js";
import { registerBotCommand } from "./commands/bot.js";
import { registerBrainCommand } from "./commands/brain.js";
import { registerChangeCommand } from "./commands/change.js";
import { registerInitCommand } from "./commands/init.js";

const program = new Command();

program
  .name("avipack")
  .description("AI-ready project starter and project-brain CLI.")
  .version("0.1.0");

registerInitCommand(program);
registerAdoptCommand(program);
registerBrainCommand(program);
registerBotCommand(program);
registerChangeCommand(program);
registerAdrCommand(program);

program.parse();
