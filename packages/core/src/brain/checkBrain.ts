import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { BrainCheckResult } from "../config/types.js";

export const requiredBrainFiles = [
  ".avipack/brain/project.yaml",
  ".avipack/brain/product-brief.md",
  ".avipack/brain/requirements.yaml",
  ".avipack/brain/architecture.yaml",
  ".avipack/brain/domain-model.yaml",
  ".avipack/brain/testing-strategy.yaml",
  ".avipack/brain/security-rules.yaml",
  ".avipack/brain/glossary.yaml",
  ".avipack/agents/AGENT_RULES.md",
  ".avipack/decisions/ADR-0001-initial-architecture.md",
  ".avipack/changes/CR-0001-initial-scope.md",
  "avipack.config.yaml"
];

export interface CheckBrainOptions {
  cwd?: string;
  strict?: boolean;
  report?: boolean;
}

const yamlFiles = requiredBrainFiles.filter((file) => file.endsWith(".yaml"));

export function checkBrain(cwdOrOptions: string | CheckBrainOptions = process.cwd()): BrainCheckResult {
  const options = typeof cwdOrOptions === "string" ? { cwd: cwdOrOptions } : cwdOrOptions;
  const cwd = options.cwd ?? process.cwd();
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsedYaml = new Map<string, unknown>();
  const missingFiles = requiredBrainFiles.filter((relativePath) => {
    return !existsSync(join(cwd, relativePath));
  });

  for (const missingFile of missingFiles) {
    errors.push(`Missing required file: ${missingFile}`);
  }

  for (const relativePath of yamlFiles) {
    if (!existsSync(join(cwd, relativePath))) {
      continue;
    }

    try {
      parsedYaml.set(relativePath, parse(readFileSync(join(cwd, relativePath), "utf8")));
    } catch (error) {
      errors.push(`Invalid YAML in ${relativePath}: ${error instanceof Error ? error.message : "parse failed"}`);
    }
  }

  addDuplicateWarnings(warnings, "requirement", getRequirementIds(parsedYaml.get(".avipack/brain/requirements.yaml")));
  const architectureIds = getArchitectureIds(parsedYaml.get(".avipack/brain/architecture.yaml"));
  addDuplicateWarnings(warnings, "architecture module", architectureIds);
  addTraceWarnings({
    cwd,
    warnings,
    requirements: parsedYaml.get(".avipack/brain/requirements.yaml"),
    architectureIds: new Set(architectureIds),
    testIds: getTestingStrategyIds(parsedYaml.get(".avipack/brain/testing-strategy.yaml"))
  });

  const passed = errors.length === 0 && (!options.strict || warnings.length === 0);
  const result: BrainCheckResult = {
    passed,
    checkedFiles: requiredBrainFiles,
    missingFiles,
    errors,
    warnings
  };

  if (options.report && canWriteBrainCheckReport(cwd)) {
    writeBrainCheckReport(cwd, result);
    result.reportWritten = true;
  } else if (options.report) {
    result.reportWritten = false;
    result.reportMessage = "Report was not written because this is not an Avipack project. Run avipack init first.";
  }

  return result;
}

function canWriteBrainCheckReport(cwd: string): boolean {
  return existsSync(join(cwd, ".avipack"));
}

function getRequirementIds(source: unknown): string[] {
  if (!isRecord(source) || !Array.isArray(source.requirements)) {
    return [];
  }

  return source.requirements.map((requirement) => (isRecord(requirement) ? requirement.id : undefined)).filter(isString);
}

function getArchitectureIds(source: unknown): string[] {
  const ids: string[] = [];

  if (!isRecord(source)) {
    return ids;
  }

  if (isRecord(source.system_overview) && isString(source.system_overview.id)) {
    ids.push(source.system_overview.id);
  }

  if (Array.isArray(source.modules)) {
    ids.push(...source.modules.map((module) => (isRecord(module) ? module.id : undefined)).filter(isString));
  }

  return ids;
}

function getTestingStrategyIds(source: unknown): Set<string> {
  const ids = new Set<string>();
  collectTestIds(source, ids);
  return ids;
}

function collectTestIds(value: unknown, ids: Set<string>): void {
  if (typeof value === "string") {
    const match = value.match(/\bTEST-\d+\b/);
    if (match) {
      ids.add(match[0]);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectTestIds(entry, ids);
    }
    return;
  }

  if (isRecord(value)) {
    for (const entry of [...Object.keys(value), ...Object.values(value)]) {
      collectTestIds(entry, ids);
    }
  }
}

function addDuplicateWarnings(warnings: string[], label: string, ids: string[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  for (const duplicate of duplicates) {
    warnings.push(`Duplicate ${label} ID: ${duplicate}`);
  }
}

function addTraceWarnings(options: {
  cwd: string;
  warnings: string[];
  requirements: unknown;
  architectureIds: Set<string>;
  testIds: Set<string>;
}): void {
  if (!isRecord(options.requirements) || !Array.isArray(options.requirements.requirements)) {
    return;
  }

  for (const requirement of options.requirements.requirements) {
    if (!isRecord(requirement) || !isString(requirement.id) || !isRecord(requirement.traces)) {
      continue;
    }

    for (const architectureId of arrayOfStrings(requirement.traces.architecture)) {
      if (!options.architectureIds.has(architectureId)) {
        options.warnings.push(`${requirement.id} traces unknown architecture ID: ${architectureId}`);
      }
    }

    for (const testId of arrayOfStrings(requirement.traces.tests)) {
      if (!options.testIds.has(testId)) {
        options.warnings.push(`${requirement.id} traces unknown test ID: ${testId}`);
      }
    }

    for (const changeId of arrayOfStrings(requirement.traces.changes)) {
      if (!changeExists(options.cwd, changeId)) {
        options.warnings.push(`${requirement.id} traces unknown change request: ${changeId}`);
      }
    }
  }
}

function changeExists(cwd: string, changeId: string): boolean {
  const changesDir = join(cwd, ".avipack/changes");
  if (!existsSync(changesDir)) {
    return false;
  }

  try {
    return readdirSync(changesDir).some((file) => file.startsWith(`${changeId}-`) && file.endsWith(".md"));
  } catch {
    return false;
  }
}

function writeBrainCheckReport(cwd: string, result: BrainCheckResult): void {
  mkdirSync(join(cwd, ".avipack/reports"), { recursive: true });
  writeFileSync(
    join(cwd, ".avipack/reports/brain-check.md"),
    `# Avipack Brain Check

## Summary
- Status: ${result.passed ? "passed" : "failed"}
- Files Checked: ${result.checkedFiles.length}
- Errors: ${result.errors.length}
- Warnings: ${result.warnings.length}

## Missing Files
${renderList(result.missingFiles)}

## Errors
${renderList(result.errors)}

## Warnings
${renderList(result.warnings)}
`
  );
}

function renderList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
