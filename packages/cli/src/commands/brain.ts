import { Command } from "commander";
import { checkBrain } from "@avipack/core";

interface BrainCheckOptions {
  json?: boolean;
  report?: boolean;
  strict?: boolean;
}

export function registerBrainCommand(program: Command): void {
  const brain = program.command("brain").description("Inspect and validate Avipack Brain files.");

  brain
    .command("check")
    .description("Run Avipack Brain validation.")
    .option("--json", "print machine-readable validation output")
    .option("--report", "write .avipack/reports/brain-check.md")
    .option("--strict", "fail when warnings are present")
    .action((options: BrainCheckOptions) => {
      const result = checkBrain({ report: options.report, strict: options.strict });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("Avipack Brain Check");
        console.log("");
        console.log(`Status: ${result.passed ? "passed" : "failed"}`);
        console.log(`Files checked: ${result.checkedFiles.length}`);
        console.log(`Errors: ${result.errors.length}`);
        console.log(`Warnings: ${result.warnings.length}`);

        if (result.missingFiles.length > 0) {
          console.log("Missing:");
          for (const missingPath of result.missingFiles) {
            console.log(`  - ${missingPath}`);
          }
        }

        if (result.errors.length > 0) {
          console.log("Errors:");
          for (const error of result.errors) {
            console.log(`  - ${error}`);
          }
        }

        if (result.warnings.length > 0) {
          console.log("Warnings:");
          for (const warning of result.warnings) {
            console.log(`  - ${warning}`);
          }
        }

        if (options.report) {
          if (result.reportWritten) {
            console.log("Report: .avipack/reports/brain-check.md");
          } else if (result.reportMessage) {
            console.log(result.reportMessage);
          }
        }
      }

      if (!result.passed) {
        process.exitCode = 1;
      }
    });
}
