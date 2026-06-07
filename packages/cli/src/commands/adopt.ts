import { Command } from "commander";
import { adoptProject, AdoptionConflictError, listStarterTemplates } from "@avipack/core";

interface AdoptCommandOptions {
  dryRun?: boolean;
  force?: boolean;
  name?: string;
  template: string;
}

export function registerAdoptCommand(program: Command): void {
  program
    .command("adopt")
    .description("Add Avipack Brain to an existing project.")
    .option("-t, --template <template>", "starter template to use", "generic-brain-only")
    .option("-n, --name <name>", "project name to write into generated brain files")
    .option("-f, --force", "overwrite Avipack-generated files")
    .option("--dry-run", "show planned adoption changes without writing files")
    .action(async (options: AdoptCommandOptions) => {
      const template = listStarterTemplates().find((entry) => entry.id === options.template);

      if (!template) {
        console.error(`Unknown Avipack template: ${options.template}`);
        process.exitCode = 1;
        return;
      }

      try {
        const result = await adoptProject({
          dryRun: options.dryRun,
          force: options.force,
          projectName: options.name,
          templateName: options.template
        });

        console.log(result.dryRun ? "Avipack adoption dry run" : "Avipack adoption completed successfully.");
        console.log("");
        console.log("Project:");
        console.log(`  Name: ${result.projectName}`);
        console.log("  Mode: adopt");
        console.log(`  Template: ${result.templateName}`);
        console.log("");
        printPathList(result.dryRun ? "Would create:" : "Created:", result.created);

        if (result.overwritten.length > 0) {
          console.log("");
          printPathList(result.dryRun ? "Would overwrite:" : "Overwritten:", result.overwritten);
        }

        if (result.skipped.length > 0) {
          console.log("");
          printPathList(result.dryRun ? "Would skip:" : "Skipped:", result.skipped);
        }

        console.log("");
        console.log("Detected:");
        console.log(`  Language: ${result.detected.language}`);
        console.log(`  Framework: ${result.detected.framework}`);
        console.log(`  Database: ${result.detected.database}`);

        if (result.detected.packageManager) {
          console.log(`  Package Manager: ${result.detected.packageManager}`);
        }

        if (!result.dryRun) {
          console.log("");
          console.log("Adoption Report:");
          console.log(`  ${result.adoptionReportPath}`);
          console.log("");
          console.log("Brain Check:");
          console.log(`  Status: ${result.brainCheck?.passed ? "passed" : "failed"}`);
        }

        console.log("");
        console.log("Next steps:");
        console.log("  1. Review .avipack/brain/product-brief.md");
        console.log("  2. Review .avipack/reports/adoption-report.md");
        console.log("  3. Update .avipack/brain/requirements.yaml based on the existing project");
        console.log("  4. Run avipack brain check");
      } catch (error) {
        if (error instanceof AdoptionConflictError) {
          console.error("Avipack adoption failed.");
          console.error("");
          console.error("Reason:");
          console.error("  Avipack already appears to be present in this project.");
          console.error("");
          console.error("Suggested fix:");
          console.error("  Run avipack adopt --force if you want to refresh Avipack-generated files.");
          process.exitCode = 1;
          return;
        }

        console.error("Avipack adoption failed.");
        console.error("");
        console.error("Reason:");
        console.error(`  ${error instanceof Error ? error.message : "Unknown error."}`);
        process.exitCode = 1;
      }
    });
}

function printPathList(heading: string, paths: string[]): void {
  console.log(heading);

  if (paths.length === 0) {
    console.log("  none");
    return;
  }

  for (const path of paths) {
    console.log(`  ${path}`);
  }
}
