import { Command } from "commander";

export function registerAdoptCommand(program: Command): void {
  program
    .command("adopt")
    .description("Add Avipack Brain to an existing project.")
    .action(() => {
      console.log("Avipack Adopt");
      console.log("");
      console.log("Status: foundation mode");
      console.log("Result: existing project adoption is scaffolded; no files were modified.");
      console.log("Next: existing project detection will be implemented in Phase 1.");
    });
}
