import { isAbsolute, relative, resolve, sep } from "node:path";

export interface SafeBotWriteValidation {
  ok: boolean;
  relativePath?: string;
  absolutePath?: string;
  reason?: string;
}

const allowedWritePrefixes = [
  ".avipack/reports/bots/",
  ".avipack/tasks/",
  ".avipack/plans/",
  ".avipack/checklists/",
  ".avipack/drafts/",
  ".avipack/decisions/drafts/",
  ".avipack/changes/drafts/",
  ".avipack/brain/maintenance/"
];

const blockedWritePrefixes = [
  "src/",
  "app/",
  "packages/",
  "tests/",
  "web/",
  "frontend/",
  "backend/",
  "public/",
  "docs/",
  "node_modules/",
  ".git/"
];

export function validateSafeBotWritePath(projectRoot: string, plannedPath: string): SafeBotWriteValidation {
  if (plannedPath.trim().length === 0) {
    return { ok: false, reason: "Write path is empty." };
  }

  if (containsPathTraversal(plannedPath)) {
    return { ok: false, reason: `Write path uses path traversal and is blocked: ${plannedPath}` };
  }

  const root = resolve(projectRoot);
  const absolutePath = isAbsolute(plannedPath) ? resolve(plannedPath) : resolve(root, plannedPath);
  const relativePath = toPosix(relative(root, absolutePath));

  if (relativePath === "" || relativePath.startsWith("../") || relativePath === "..") {
    return { ok: false, reason: `Write path is outside the project root: ${plannedPath}` };
  }

  if (blockedWritePrefixes.some((prefix) => relativePath === prefix.slice(0, -1) || relativePath.startsWith(prefix))) {
    return { ok: false, reason: `Write path targets blocked project area: ${relativePath}` };
  }

  if (!allowedWritePrefixes.some((prefix) => relativePath.startsWith(prefix))) {
    return { ok: false, reason: `Write path is not an approved .avipack bot artifact path: ${relativePath}` };
  }

  return {
    ok: true,
    relativePath,
    absolutePath
  };
}

export function approvedBotWritePrefixes(): string[] {
  return [...allowedWritePrefixes];
}

function containsPathTraversal(path: string): boolean {
  return path.split(/[\\/]+/).includes("..");
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}
