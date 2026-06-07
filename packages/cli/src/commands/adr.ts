import { Command } from "commander";

export function registerAdrCommand(program: Command): void {
  const adr = program.command("adr").description("Manage architecture decision records.");

  adr
    .command("new")
    .description("Create a new architecture decision record.")
    .action(() => {
      console.log("Avipack ADR");
      console.log("");
      console.log("Status: foundation mode");
      console.log("Result: ADR creation is scaffolded.");
      console.log("Next: ADR numbering and template generation will be implemented in Phase 1.");
    });
}
