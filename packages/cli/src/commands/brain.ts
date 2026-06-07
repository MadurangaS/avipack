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
      console.log("Status: foundation mode");
      console.log(
        `Result: ${
          result.status === "ok"
            ? "basic structure validation completed"
            : "basic structure validation found missing files"
        }`
      );

      if (result.missingPaths.length > 0) {
        console.log("Missing:");
        for (const missingPath of result.missingPaths) {
          console.log(`- ${missingPath}`);
        }
      }

      console.log("Next: advanced conflict engine will be implemented in a future milestone.");
    });
}
