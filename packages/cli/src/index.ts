#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { registerAdrCommand } from "./commands/adr.js";
import { registerAdoptCommand } from "./commands/adopt.js";
import { registerBotCommand } from "./commands/bot.js";
import { registerBrainCommand } from "./commands/brain.js";
import { registerChangeCommand } from "./commands/change.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerInitCommand } from "./commands/init.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };
const version = `avipack ${packageJson.version}`;
const program = new Command();

program
  .name("avipack")
  .description("AI-ready project starter and project-brain CLI.")
  .version(version, "-V, --version", "output the Avipack CLI version");

registerInitCommand(program);
registerAdoptCommand(program);
registerBrainCommand(program);
registerBotCommand(program);
registerChangeCommand(program);
registerAdrCommand(program);
registerDoctorCommand(program);

program
  .command("version")
  .description("Print the Avipack CLI version.")
  .action(() => {
    console.log(version);
  });

program.parse();
