import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

export interface FileExistenceSummary {
  path: string;
  exists: boolean;
  type: "file" | "directory" | "missing" | "other";
}

export async function readOptionalTextFile(cwd: string, relativePath: string): Promise<string | undefined> {
  const absolutePath = join(cwd, relativePath);
  if (!existsSync(absolutePath)) {
    return undefined;
  }

  return readFile(absolutePath, "utf8");
}

export async function parseOptionalYaml(cwd: string, relativePath: string): Promise<unknown | undefined> {
  const source = await readOptionalTextFile(cwd, relativePath);
  return source === undefined ? undefined : parse(source);
}

export async function summarizePath(cwd: string, relativePath: string): Promise<FileExistenceSummary> {
  const absolutePath = join(cwd, relativePath);
  if (!existsSync(absolutePath)) {
    return { path: relativePath, exists: false, type: "missing" };
  }

  const pathStat = await stat(absolutePath);
  return {
    path: relativePath,
    exists: true,
    type: pathStat.isFile() ? "file" : pathStat.isDirectory() ? "directory" : "other"
  };
}

export async function inspectDirectory(cwd: string, relativePath: string): Promise<string[]> {
  const absolutePath = join(cwd, relativePath);
  if (!existsSync(absolutePath)) {
    return [];
  }

  const entries = await readdir(absolutePath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() || entry.isDirectory())
    .map((entry) => `${relativePath}/${entry.name}`)
    .sort();
}

export function timestampedArtifactPath(prefix: string, name: string, timestamp: string, extension: "md" | "yaml" = "md"): string {
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  return `${normalizedPrefix}${name}-${safeTimestamp}.${extension}`;
}
