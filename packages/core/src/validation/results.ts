export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  file?: string;
  path?: string;
  hint?: string;
}

export interface ValidationReport {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export function createValidationReport(issues: ValidationIssue[], strict = false): ValidationReport {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const info = issues.filter((issue) => issue.severity === "info");

  return {
    ok: errors.length === 0 && (!strict || warnings.length === 0),
    errors,
    warnings,
    info
  };
}

export function issueMessage(issue: ValidationIssue): string {
  return issue.message;
}
