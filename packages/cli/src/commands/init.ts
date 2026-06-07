import { Command } from "commander";
import { createBrain, listStarterTemplates } from "@avipack/core";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a new Avipack-ready project foundation.")
    .option("-t, --template <template>", "starter template to use", "generic-brain-only")
    .action((options: { template: string }) => {
      const template = listStarterTemplates().find((entry) => entry.id === options.template);
      const result = createBrain({ template: options.template });

      console.log("Avipack Init");
      console.log("");
      console.log(`Status: foundation mode`);
      console.log(`Template: ${template?.id ?? options.template}`);
      console.log(`Result: ${result.message}`);
      console.log("Next: template file generation will be implemented in Phase 1.");
    });
}
