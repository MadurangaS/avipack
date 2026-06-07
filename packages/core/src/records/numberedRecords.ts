import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface NextRecordOptions {
  directory: string;
  prefix: string;
  title: string;
}

export interface NextRecordPath {
  number: number;
  filename: string;
  relativePath: string;
  absolutePath: string;
}

export async function getNextRecordPath(options: NextRecordOptions): Promise<NextRecordPath> {
  const number = (await getHighestRecordNumber(options.directory, options.prefix)) + 1;
  const filename = `${options.prefix}-${String(number).padStart(4, "0")}-${slugifyTitle(options.title)}.md`;
  const relativeFolder = options.prefix === "CR" ? ".avipack/changes" : ".avipack/decisions";

  return {
    number,
    filename,
    relativePath: `${relativeFolder}/${filename}`,
    absolutePath: join(options.directory, filename)
  };
}

export async function getHighestRecordNumber(directory: string, prefix: string): Promise<number> {
  if (!existsSync(directory)) {
    return 0;
  }

  const entries = await readdir(directory);
  const numbers = entries
    .map((entry) => entry.match(new RegExp(`^${prefix}-(\\d{4})-.*\\.md$`))?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number(value));

  return numbers.length > 0 ? Math.max(...numbers) : 0;
}

export function slugifyTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled";
}
