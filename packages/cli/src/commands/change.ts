import { Command } from "commander";
import { createChangeRequest } from "@avipack/core";

interface ChangeNewOptions {
  title?: string;
  summary?: string;
  status?: string;
  requirement?: string[];
  dryRun?: boolean;
}

export function registerChangeCommand(program: Command): void {
  const change = program.command("change").description("Manage Avipack change requests.");

  change
    .command("new")
    .argument("[title...]", "change request title")
    .description("Create a new change request.")
    .option("--title <title>", "change request title")
    .option("--summary <summary>", "short change summary")
    .option("--status <status>", "change request status", "proposed")
    .option("--requirement <id>", "linked requirement id", collectValues, [])
    .option("--dry-run", "show the next file path without writing")
    .action(async (titleParts: string[], options: ChangeNewOptions) => {
      const title = options.title ?? titleParts.join(" ");

      if (!title) {
        console.error("Change request title is required. Use --title <title> or pass a title argument.");
        process.exitCode = 1;
        return;
      }

      try {
        const result = await createChangeRequest({
          title,
          summary: options.summary,
          status: options.status,
          requirements: options.requirement,
          dryRun: options.dryRun
        });

        console.log(result.dryRun ? "Avipack change request dry run." : "Avipack change request created.");
        console.log("");
        console.log(`Path: ${result.path}`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : "Change request creation failed.");
        process.exitCode = 1;
      }
    });
}

function collectValues(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}
