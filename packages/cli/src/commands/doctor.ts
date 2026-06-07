import { Command } from "commander";
import { checkDoctor } from "@avipack/core";

interface DoctorOptions {
  json?: boolean;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check local Avipack CLI and project health.")
    .option("--json", "print machine-readable doctor output")
    .action((options: DoctorOptions) => {
      const result = checkDoctor();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("Avipack Doctor");
        console.log("");
        console.log("Runtime:");
        console.log(`- Node.js: ${result.runtime.node}`);
        console.log(`- Platform: ${result.runtime.platform} ${result.runtime.arch}`);
        console.log("");
        console.log("Project:");
        console.log(`- Current directory: ${result.cwd}`);
        console.log(`- Avipack project: ${result.project.isAvipackProject ? "yes" : "no"}`);
        console.log(`- .avipack: ${result.project.hasAvipackDirectory ? "present" : "missing"}`);
        console.log(`- Config: ${result.project.configParseable ? "ok" : result.project.hasConfig ? "invalid" : "missing"}`);
        console.log(`- Brain files: ${formatOptionalCheck(result.project.brainFilesOk)}`);
        console.log(`- Bots: ${formatOptionalCheck(result.project.botsOk)}`);
        console.log(`- Reports directory: ${formatOptionalWritable(result.project.reportsWritable)}`);

        if (result.warnings.length > 0) {
          console.log("");
          console.log("Warnings:");
          for (const warning of result.warnings) {
            console.log(`- ${warning}`);
          }
        }

        if (result.errors.length > 0) {
          console.log("");
          console.log("Errors:");
          for (const error of result.errors) {
            console.log(`- ${error}`);
          }
        }

        console.log("");
        console.log(`Result: ${result.healthy ? "healthy" : "unhealthy"}`);
      }

      if (!result.healthy) {
        process.exitCode = 1;
      }
    });
}

function formatOptionalCheck(value: boolean | undefined): string {
  if (value === undefined) {
    return "not checked";
  }

  return value ? "ok" : "failed";
}

function formatOptionalWritable(value: boolean | undefined): string {
  if (value === undefined) {
    return "not checked";
  }

  return value ? "writable" : "not writable";
}
