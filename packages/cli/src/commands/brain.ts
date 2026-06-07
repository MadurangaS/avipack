import { Command } from "commander";
import { checkBrain } from "@avipack/core";

export function registerBrainCommand(program: Command): void {
  const brain = program.command("brain").description("Inspect and validate Avipack Brain files.");

  brain
    .command("check")
    .description("Run basic Avipack Brain structure validation.")
    .action(() => {
      const result = checkBrain();

      console.log("Avipack Brain Check");
      console.log("");
      console.log(`Status: ${result.passed ? "passed" : "failed"}`);
      console.log(`Files checked: ${result.checkedFiles.length}`);

      if (result.missingFiles.length > 0) {
        console.log("Missing:");
        for (const missingPath of result.missingFiles) {
          console.log(`  - ${missingPath}`);
        }
      }

      console.log("Next: advanced conflict engine will be implemented in a future milestone.");
    });
}
