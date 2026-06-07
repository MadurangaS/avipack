import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { isAvipackProject } from "../config/loadConfig.js";
import { AvipackProjectRequiredError } from "../bots/botLifecycle.js";
import { getNextRecordPath } from "./numberedRecords.js";

export interface CreateChangeRequestOptions {
  cwd?: string;
  title: string;
  summary?: string;
  status?: string;
  requirements?: string[];
  dryRun?: boolean;
}

export interface CreateChangeRequestResult {
  title: string;
  status: string;
  path: string;
  dryRun: boolean;
}

export async function createChangeRequest(options: CreateChangeRequestOptions): Promise<CreateChangeRequestResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  requireAvipackProject(cwd);
  const status = options.status ?? "proposed";
  const changesDir = join(cwd, ".avipack/changes");
  const nextPath = await getNextRecordPath({ directory: changesDir, prefix: "CR", title: options.title });

  if (!options.dryRun) {
    if (existsSync(nextPath.absolutePath)) {
      throw new Error(`Change request already exists: ${nextPath.relativePath}`);
    }

    await mkdir(changesDir, { recursive: true });
    await writeFile(nextPath.absolutePath, renderChangeRequest({ ...options, status }));
  }

  return {
    title: options.title,
    status,
    path: nextPath.relativePath,
    dryRun: Boolean(options.dryRun)
  };
}

function renderChangeRequest(options: CreateChangeRequestOptions & { status: string }): string {
  const requirements = options.requirements && options.requirements.length > 0 ? options.requirements : ["none"];

  return `# ${options.title}

Status: ${options.status}
Date: ${new Date().toISOString().slice(0, 10)}

## Summary
${options.summary ?? "TBD"}

## Linked Requirements
${requirements.map((requirement) => `- ${requirement}`).join("\n")}

## Reason
TBD

## Impact
TBD

## Acceptance Criteria
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
