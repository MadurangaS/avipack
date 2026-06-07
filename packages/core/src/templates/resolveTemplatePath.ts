import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { starterTemplates } from "./templateRegistry.js";

export function resolveTemplatePath(templateId: string): string {
  const template = starterTemplates.find((entry) => entry.id === templateId);

  if (!template) {
    throw new Error(`Unknown Avipack template: ${templateId}`);
  }

  if (template.id !== "generic-brain-only") {
    throw new Error(`Template is not implemented yet: ${templateId}`);
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(currentDir, "../../../templates", template.id, "template");

  if (!existsSync(templatePath)) {
    throw new Error(`Template files were not found: ${templatePath}`);
  }

  return templatePath;
}
