import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

export interface CopyTemplateOptions {
  force?: boolean;
}

export interface CopyTemplateResult {
  createdPaths: string[];
}

const protectedTargets = [".avipack", "avipack.config.yaml", "README.md"];
const createdPathDisplayOrder = [".avipack/", "avipack.config.yaml", "README.md"];

export class TemplateConflictError extends Error {
  readonly conflicts: string[];

  constructor(conflicts: string[]) {
    super("Avipack already appears to be initialized in this directory.");
    this.name = "TemplateConflictError";
    this.conflicts = conflicts;
  }
}

export async function copyTemplate(
  templatePath: string,
  targetPath: string,
  options: CopyTemplateOptions = {}
): Promise<CopyTemplateResult> {
  const conflicts = protectedTargets.filter((entry) => existsSync(join(targetPath, entry)));

  if (conflicts.length > 0 && !options.force) {
    throw new TemplateConflictError(conflicts);
  }

  if (options.force) {
    // MVP force mode replaces only the known Avipack-generated top-level targets.
    await Promise.all(
      protectedTargets.map(async (entry) => {
        await rm(join(targetPath, entry), { recursive: true, force: true });
      })
    );
  }

  await mkdir(targetPath, { recursive: true });

  for (const entry of await readdir(templatePath, { withFileTypes: true })) {
    await cp(join(templatePath, entry.name), join(targetPath, entry.name), {
      recursive: true,
      force: false,
      errorOnExist: true
    });
  }

  return {
    createdPaths: await listTopLevelTemplateEntries(templatePath)
  };
}

async function listTopLevelTemplateEntries(templatePath: string): Promise<string[]> {
  const entries = await readdir(templatePath, { withFileTypes: true });
  const paths = entries.map((entry) => {
    const name = relative(templatePath, join(templatePath, entry.name));
    return entry.isDirectory() ? `${name}/` : name;
  });

  return paths.sort((left, right) => {
    const leftIndex = createdPathDisplayOrder.indexOf(left);
    const rightIndex = createdPathDisplayOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}
