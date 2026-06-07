import { parse } from "yaml";

export interface YamlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateYaml(source: string): YamlValidationResult {
  try {
    parse(source);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown YAML parse error"
    };
  }
}
