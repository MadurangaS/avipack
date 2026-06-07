import { Command } from "commander";

export function registerChangeCommand(program: Command): void {
  const change = program.command("change").description("Manage Avipack change requests.");

  change
    .command("new")
    .description("Create a new change request.")
    .action(() => {
      console.log("Avipack Change Request");
      console.log("");
      console.log("Status: foundation mode");
      console.log("Result: change request creation is scaffolded.");
      console.log("Next: CR numbering and template generation will be implemented in Phase 1.");
    });
}
