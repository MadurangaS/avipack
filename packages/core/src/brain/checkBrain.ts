import { existsSync } from "node:fs";
import { join } from "node:path";
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

export function checkBrain(cwd = process.cwd()): BrainCheckResult {
  const missingFiles = requiredBrainFiles.filter((relativePath) => {
    return !existsSync(join(cwd, relativePath));
  });

  return {
    passed: missingFiles.length === 0,
    checkedFiles: requiredBrainFiles,
    missingFiles
  };
}
