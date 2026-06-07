import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import type { AvipackConfig } from "./types.js";

export function loadConfig(cwd = process.cwd()): AvipackConfig | null {
  const configPath = join(cwd, "avipack.config.yaml");

  if (!existsSync(configPath)) {
    return null;
  }

  return normalizeConfig(parse(readFileSync(configPath, "utf8")) as Partial<AvipackConfig>);
}

export function normalizeConfig(config: Partial<AvipackConfig>): AvipackConfig {
  const enabled = uniqueStrings(config.bots?.enabled);
  const installed = config.bots && "installed" in config.bots ? uniqueStrings(config.bots.installed) : enabled;

  return {
    project: {
      id: config.project?.id,
      name: config.project?.name ?? "unknown",
      template: config.project?.template,
      mode: config.project?.mode
    },
    brain: {
      root: config.brain?.root ?? ".avipack",
      path: config.brain?.path ?? ".avipack/brain"
    },
    bots: {
      installed,
      enabled
    }
  };
}

export async function writeConfig(cwd: string, config: AvipackConfig): Promise<void> {
  await writeFile(join(cwd, "avipack.config.yaml"), stringify(normalizeConfig(config)));
}

export function isAvipackProject(cwd = process.cwd()): boolean {
  return existsSync(join(cwd, "avipack.config.yaml")) && existsSync(join(cwd, ".avipack"));
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.filter((value): value is string => typeof value === "string"))];
}
