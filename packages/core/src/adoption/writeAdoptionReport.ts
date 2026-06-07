import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DetectedProject } from "./detectProject.js";

export interface WriteAdoptionReportOptions {
  targetDir: string;
  projectName: string;
  detected: DetectedProject;
  created: string[];
  skipped: string[];
  overwritten: string[];
  adoptedAt?: Date;
}

export const adoptionReportPath = ".avipack/reports/adoption-report.md";

export async function writeAdoptionReport(options: WriteAdoptionReportOptions): Promise<void> {
  const reportFilePath = join(options.targetDir, adoptionReportPath);
  await mkdir(join(options.targetDir, ".avipack/reports"), { recursive: true });
  await writeFile(reportFilePath, renderAdoptionReport(options));
}

function renderAdoptionReport(options: WriteAdoptionReportOptions): string {
  const adoptedAt = (options.adoptedAt ?? new Date()).toISOString();
  const detectedFiles = options.detected.detectedFiles.length > 0 ? options.detected.detectedFiles : ["none"];
  const createdFiles = options.created.length > 0 ? options.created : ["none"];
  const skippedFiles = options.skipped.length > 0 ? options.skipped : ["none"];
  const overwrittenFiles = options.overwritten.length > 0 ? options.overwritten : ["none"];

  return `# Avipack Adoption Report

## Project
- Name: ${options.projectName}
- Adopted At: ${adoptedAt}
- Mode: adopt

## Detected Stack
- Language: ${options.detected.language}
- Framework: ${options.detected.framework}
- Database: ${options.detected.database}
- Package Manager: ${options.detected.packageManager ?? "unknown"}

## Detected Files
${renderList(detectedFiles)}

## Created Files
${renderList(createdFiles)}

## Overwritten Files
${renderList(overwrittenFiles)}

## Skipped Files
${renderList(skippedFiles)}

## Recommended Next Steps
1. Review product brief.
2. Update requirements.
3. Update architecture.
4. Run brain check.
`;
}

function renderList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}
