import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { AvipackConfig } from "./types.js";

export function loadConfig(cwd = process.cwd()): AvipackConfig | null {
  const configPath = join(cwd, "avipack.config.yaml");

  if (!existsSync(configPath)) {
    return null;
  }

  return parse(readFileSync(configPath, "utf8")) as AvipackConfig;
}
