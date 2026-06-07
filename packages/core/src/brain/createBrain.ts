import { basename, resolve } from "node:path";
import { checkBrain } from "./checkBrain.js";
import type { BrainCheckResult } from "../config/types.js";
import { copyTemplate, TemplateConflictError } from "../templates/copyTemplate.js";
import { resolveTemplatePath } from "../templates/resolveTemplatePath.js";
import { updateGeneratedProjectMetadata } from "../templates/updateGeneratedProjectMetadata.js";

export interface CreateBrainOptions {
  cwd?: string;
  template?: string;
  force?: boolean;
  projectName?: string;
}

export interface CreateBrainResult {
  status: "created";
  template: string;
  targetPath: string;
  projectName: string;
  createdPaths: string[];
  brainCheck: BrainCheckResult;
}

export { TemplateConflictError };

export function deriveProjectName(cwd = process.cwd()): string {
  return basename(resolve(cwd));
}

export async function createBrain(options: CreateBrainOptions = {}): Promise<CreateBrainResult> {
  const template = options.template ?? "generic-brain-only";
  const targetPath = resolve(options.cwd ?? process.cwd());
  const projectName = options.projectName ?? deriveProjectName(targetPath);
  const templatePath = resolveTemplatePath(template);
  const copyResult = await copyTemplate(templatePath, targetPath, { force: options.force });

  await updateGeneratedProjectMetadata(targetPath, { projectName });

  return {
    status: "created",
    template,
    targetPath,
    projectName,
    createdPaths: copyResult.createdPaths,
    brainCheck: checkBrain(targetPath)
  };
}
