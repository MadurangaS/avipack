import { Command } from "commander";
import { createBrain } from "@avipack/core";

export function registerAdoptCommand(program: Command): void {
  program
    .command("adopt")
    .description("Add Avipack Brain to an existing project.")
    .action(() => {
      const result = createBrain({ template: "generic-brain-only" });

      console.log("Avipack Adopt");
      console.log("");
      console.log("Status: foundation mode");
      console.log(`Result: ${result.message}`);
      console.log("Next: existing project detection will be implemented in Phase 1.");
    });
}
