import { existsSync } from "node:fs";
import { join } from "node:path";
import type { BrainCheckResult } from "../config/types.js";

const requiredBrainPaths = [
  ".avipack/brain/project.yaml",
  ".avipack/brain/requirements.yaml",
  ".avipack/brain/architecture.yaml",
  ".avipack/decisions",
  ".avipack/changes",
  ".avipack/agents",
  ".avipack/schemas",
  ".avipack/reports",
  ".avipack/avipack.lock"
];

export function checkBrain(cwd = process.cwd()): BrainCheckResult {
  const missingPaths = requiredBrainPaths.filter((relativePath) => {
    return !existsSync(join(cwd, relativePath));
  });

  return {
    status: missingPaths.length === 0 ? "ok" : "missing",
    checkedPath: join(cwd, ".avipack"),
    missingPaths
  };
}
