import { Command } from "commander";
import { createBrain, listStarterTemplates, TemplateConflictError } from "@avipack/core";

interface InitCommandOptions {
  force?: boolean;
  name?: string;
  template: string;
}

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a new Avipack-ready project foundation.")
    .option("-t, --template <template>", "starter template to use", "generic-brain-only")
    .option("-n, --name <name>", "project name to write into generated brain files")
    .option("-f, --force", "overwrite Avipack-generated files")
    .action(async (options: InitCommandOptions) => {
      const template = listStarterTemplates().find((entry) => entry.id === options.template);

      if (!template) {
        console.error(`Unknown Avipack template: ${options.template}`);
        process.exitCode = 1;
        return;
      }

      try {
        const result = await createBrain({
          force: options.force,
          projectName: options.name,
          template: options.template
        });

        console.log("Avipack initialized successfully.");
        console.log("");
        console.log("Project:");
        console.log(`  Name: ${result.projectName}`);
        console.log(`  Template: ${result.template}`);
        console.log("");
        console.log("Created:");
        for (const createdPath of result.createdPaths) {
          console.log(`  ${createdPath}`);
        }
        console.log("");
        console.log("Brain Check:");
        console.log(`  Status: ${result.brainCheck.passed ? "passed" : "failed"}`);
        console.log(`  Files checked: ${result.brainCheck.checkedFiles.length}`);

        if (result.brainCheck.missingFiles.length > 0) {
          console.log("  Missing files:");
          for (const missingFile of result.brainCheck.missingFiles) {
            console.log(`    - ${missingFile}`);
          }
        }

        console.log("");
        console.log("Next steps:");
        console.log("  1. Review .avipack/brain/product-brief.md");
        console.log("  2. Update .avipack/brain/requirements.yaml");
        console.log("  3. Run avipack brain check");
      } catch (error) {
        if (error instanceof TemplateConflictError) {
          console.error("Avipack already appears to be initialized in this directory.");
          console.error("");
          console.error("Use:");
          console.error("  avipack init --force");
          console.error("");
          console.error("to overwrite Avipack-generated files.");
          process.exitCode = 1;
          return;
        }

        console.error(error instanceof Error ? error.message : "Avipack init failed.");
        process.exitCode = 1;
      }
    });
}
