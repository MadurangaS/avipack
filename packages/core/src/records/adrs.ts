import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { isAvipackProject } from "../config/loadConfig.js";
import { AvipackProjectRequiredError } from "../bots/botLifecycle.js";
import { getNextRecordPath } from "./numberedRecords.js";

export interface CreateAdrOptions {
  cwd?: string;
  title: string;
  status?: string;
  context?: string;
  decision?: string;
  dryRun?: boolean;
}

export interface CreateAdrResult {
  title: string;
  status: string;
  path: string;
  dryRun: boolean;
}

export async function createAdr(options: CreateAdrOptions): Promise<CreateAdrResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  requireAvipackProject(cwd);
  const status = options.status ?? "proposed";
  const decisionsDir = join(cwd, ".avipack/decisions");
  const nextPath = await getNextRecordPath({ directory: decisionsDir, prefix: "ADR", title: options.title });

  if (!options.dryRun) {
    if (existsSync(nextPath.absolutePath)) {
      throw new Error(`ADR already exists: ${nextPath.relativePath}`);
    }

    await mkdir(decisionsDir, { recursive: true });
    await writeFile(nextPath.absolutePath, renderAdr({ ...options, status }));
  }

  return {
    title: options.title,
    status,
    path: nextPath.relativePath,
    dryRun: Boolean(options.dryRun)
  };
}

function renderAdr(options: CreateAdrOptions & { status: string }): string {
  return `# ${options.title}

Status: ${options.status}
Date: ${new Date().toISOString().slice(0, 10)}

## Context
${options.context ?? "TBD"}

## Decision
${options.decision ?? "TBD"}

## Consequences
- TBD

## Linked Requirements
- none

## Alternatives Considered
- TBD

## Notes
TBD
`;
}

function requireAvipackProject(cwd: string): void {
  if (!isAvipackProject(cwd)) {
    throw new AvipackProjectRequiredError();
  }
}
