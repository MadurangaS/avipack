import { Command } from "commander";
import { createAdr } from "@avipack/core";

interface AdrNewOptions {
  title?: string;
  status?: string;
  context?: string;
  decision?: string;
  dryRun?: boolean;
}

export function registerAdrCommand(program: Command): void {
  const adr = program.command("adr").description("Manage architecture decision records.");

  adr
    .command("new")
    .argument("[title...]", "ADR title")
    .description("Create a new architecture decision record.")
    .option("--title <title>", "ADR title")
    .option("--status <status>", "ADR status", "proposed")
    .option("--context <text>", "ADR context")
    .option("--decision <text>", "ADR decision")
    .option("--dry-run", "show the next file path without writing")
    .action(async (titleParts: string[], options: AdrNewOptions) => {
      const title = options.title ?? titleParts.join(" ");

      if (!title) {
        console.error("ADR title is required. Use --title <title> or pass a title argument.");
        process.exitCode = 1;
        return;
      }

      try {
        const result = await createAdr({
          title,
          status: options.status,
          context: options.context,
          decision: options.decision,
          dryRun: options.dryRun
        });

        console.log(result.dryRun ? "Avipack ADR dry run." : "Avipack ADR created.");
        console.log("");
        console.log(`Path: ${result.path}`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : "ADR creation failed.");
        process.exitCode = 1;
      }
    });
}
