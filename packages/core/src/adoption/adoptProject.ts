import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { BrainCheckResult } from "../config/types.js";
import { checkBrain } from "../brain/checkBrain.js";
import { resolveTemplatePath } from "../templates/resolveTemplatePath.js";
import { detectProject, type DetectedProject } from "./detectProject.js";
import { adoptionReportPath, writeAdoptionReport } from "./writeAdoptionReport.js";

export type AdoptProjectOptions = {
  targetDir?: string;
  projectName?: string;
  templateName?: string;
  force?: boolean;
  dryRun?: boolean;
};

export type AdoptProjectResult = {
  projectName: string;
  templateName: string;
  dryRun: boolean;
  created: string[];
  skipped: string[];
  overwritten: string[];
  detected: DetectedProject;
  brainCheck?: BrainCheckResult;
  adoptionReportPath: string;
};

export class AdoptionConflictError extends Error {
  readonly conflicts: string[];

  constructor(conflicts: string[]) {
    super("Avipack already appears to be present in this project.");
    this.name = "AdoptionConflictError";
    this.conflicts = conflicts;
  }
}

const avipackTargets = [".avipack", "avipack.config.yaml"];

export async function adoptProject(options: AdoptProjectOptions = {}): Promise<AdoptProjectResult> {
  const targetDir = resolve(options.targetDir ?? process.cwd());
  const templateName = options.templateName ?? "generic-brain-only";
  const templatePath = resolveTemplatePath(templateName);
  const detected = await detectProject(targetDir, options.projectName);
  const projectName = detected.name;
  const conflicts = avipackTargets.filter((entry) => existsSync(join(targetDir, entry)));
  const readmeExists = existsSync(join(targetDir, "README.md"));
  const dryRun = options.dryRun === true;

  if (conflicts.length > 0 && !options.force) {
    throw new AdoptionConflictError(conflicts);
  }

  const created = plannedCreatedPaths(conflicts, readmeExists, Boolean(options.force));
  const overwritten = options.force ? conflicts.map(displayPath) : [];
  const skipped = readmeExists ? ["README.md already exists and was not overwritten"] : [];

  if (!dryRun) {
    await writeAdoptionFiles({
      targetDir,
      templatePath,
      projectName,
      detected,
      readmeExists,
      force: Boolean(options.force)
    });

    await writeAdoptionReport({
      targetDir,
      projectName,
      detected,
      created,
      skipped,
      overwritten
    });
  }

  return {
    projectName,
    templateName,
    dryRun,
    created,
    skipped,
    overwritten,
    detected,
    brainCheck: dryRun ? undefined : checkBrain(targetDir),
    adoptionReportPath
  };
}

interface WriteAdoptionFilesOptions {
  targetDir: string;
  templatePath: string;
  projectName: string;
  detected: DetectedProject;
  readmeExists: boolean;
  force: boolean;
}

async function writeAdoptionFiles(options: WriteAdoptionFilesOptions): Promise<void> {
  if (options.force) {
    await Promise.all(
      avipackTargets.map(async (entry) => {
        await rm(join(options.targetDir, entry), { recursive: true, force: true });
      })
    );
  }

  await mkdir(options.targetDir, { recursive: true });
  await cp(join(options.templatePath, ".avipack"), join(options.targetDir, ".avipack"), {
    recursive: true,
    force: false,
    errorOnExist: true
  });

  await cp(join(options.templatePath, "avipack.config.yaml"), join(options.targetDir, "avipack.config.yaml"), {
    force: false,
    errorOnExist: true
  });

  if (!options.readmeExists) {
    await cp(join(options.templatePath, "README.md"), join(options.targetDir, "README.md"), {
      force: false,
      errorOnExist: true
    });
    await updateGeneratedReadme(options.targetDir, options.projectName);
  }

  await writeAdoptedProjectYaml(options.targetDir, options.projectName, options.detected);
  await writeAdoptedConfigYaml(options.targetDir, options.projectName);
}

function plannedCreatedPaths(conflicts: string[], readmeExists: boolean, force: boolean): string[] {
  const conflictSet = new Set(conflicts);
  const created = avipackTargets
    .filter((entry) => !force || !conflictSet.has(entry))
    .map(displayPath);

  if (!readmeExists) {
    created.push("README.md");
  }

  created.push(adoptionReportPath);
  return created;
}

async function writeAdoptedProjectYaml(targetDir: string, projectName: string, detected: DetectedProject): Promise<void> {
  await writeFile(
    join(targetDir, ".avipack/brain/project.yaml"),
    `project:
  id: ${yamlString(projectName)}
  name: ${yamlString(projectName)}
  version: 0.1.0
  type: adopted-existing-project
  created_by: avipack
  stack:
    language: ${yamlString(detected.language)}
    framework: ${yamlString(detected.framework)}
    database: ${yamlString(detected.database)}

governance:
  requirement_versioning: true
  architecture_decision_records: true
  change_request_tracking: true
  ai_agent_control: true
  conflict_detection: planned
`
  );
}

async function writeAdoptedConfigYaml(targetDir: string, projectName: string): Promise<void> {
  await writeFile(
    join(targetDir, "avipack.config.yaml"),
    `project:
  name: ${yamlString(projectName)}
  mode: adopt

brain:
  root: .avipack
  path: .avipack/brain

bots:
  installed: []
  enabled: []
`
  );
}

function displayPath(entry: string): string {
  return entry === ".avipack" ? ".avipack/" : entry;
}

async function updateGeneratedReadme(targetDir: string, projectName: string): Promise<void> {
  const readmePath = join(targetDir, "README.md");
  const source = await readFile(readmePath, "utf8");
  const updated = source.replaceAll("sample-project", projectName).replaceAll("Sample Project", projectName);
  await writeFile(readmePath, updated);
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}
