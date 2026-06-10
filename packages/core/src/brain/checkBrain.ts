import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { BrainCheckResult } from "../config/types.js";
import { listKnownBots } from "../plugins/botRegistry.js";
import { createValidationReport, issueMessage, type ValidationIssue } from "../validation/results.js";

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

const optionalBrainFiles = [".avipack/brain/sprint-lock.yaml"];

export interface CheckBrainOptions {
  cwd?: string;
  strict?: boolean;
  report?: boolean;
}

const checkedBrainFiles = [...requiredBrainFiles, ...optionalBrainFiles];
const yamlFiles = checkedBrainFiles.filter((file) => file.endsWith(".yaml"));
const requirementStatuses = new Set(["proposed", "approved", "in_progress", "done", "rejected", "deferred"]);
const requirementPriorities = new Set(["low", "medium", "high", "critical"]);
const sprintLockStatuses = new Set(["locked", "unlocked"]);

export function checkBrain(cwdOrOptions: string | CheckBrainOptions = process.cwd()): BrainCheckResult {
  const options = typeof cwdOrOptions === "string" ? { cwd: cwdOrOptions } : cwdOrOptions;
  const cwd = options.cwd ?? process.cwd();
  const issues: ValidationIssue[] = [];
  const parsedYaml = new Map<string, unknown>();
  const missingFiles = requiredBrainFiles.filter((relativePath) => !existsSync(join(cwd, relativePath)));

  for (const missingFile of missingFiles) {
    issues.push({
      code: "BRAIN_REQUIRED_FILE_MISSING",
      severity: "error",
      message: `Missing required file: ${missingFile}`,
      file: missingFile
    });
  }

  for (const relativePath of yamlFiles) {
    if (!existsSync(join(cwd, relativePath))) {
      continue;
    }

    try {
      parsedYaml.set(relativePath, parse(readFileSync(join(cwd, relativePath), "utf8")));
    } catch (error) {
      issues.push({
        code: "YAML_PARSE_ERROR",
        severity: "error",
        message: `Invalid YAML in ${relativePath}: ${error instanceof Error ? error.message : "parse failed"}`,
        file: relativePath
      });
    }
  }

  validateConfig(parsedYaml.get("avipack.config.yaml"), issues);
  validateProject(parsedYaml.get(".avipack/brain/project.yaml"), issues);
  validateRequirements(parsedYaml.get(".avipack/brain/requirements.yaml"), issues);
  validateArchitecture(parsedYaml.get(".avipack/brain/architecture.yaml"), issues);
  validateDomainModel(parsedYaml.get(".avipack/brain/domain-model.yaml"), issues);
  validateTestingStrategy(parsedYaml.get(".avipack/brain/testing-strategy.yaml"), issues);
  validateSecurityRules(parsedYaml.get(".avipack/brain/security-rules.yaml"), issues);
  validateGlossary(parsedYaml.get(".avipack/brain/glossary.yaml"), issues);
  validateSprintLock(parsedYaml.get(".avipack/brain/sprint-lock.yaml"), issues);
  validateCrossReferences(cwd, parsedYaml, issues);

  const validationReport = createValidationReport(issues, options.strict);
  const errors = validationReport.errors.map(issueMessage);
  const warnings = validationReport.warnings.map(issueMessage);
  const result: BrainCheckResult = {
    passed: validationReport.ok,
    checkedFiles: checkedBrainFiles,
    missingFiles,
    errors,
    warnings,
    issues,
    validationReport
  };

  if (options.report && canWriteBrainCheckReport(cwd)) {
    writeBrainCheckReport(cwd, result);
    result.reportWritten = true;
  } else if (options.report) {
    result.reportWritten = false;
    result.reportMessage = "Report was not written because this is not an Avipack project. Run avipack init first.";
  }

  return result;
}

function validateConfig(source: unknown, issues: ValidationIssue[]): void {
  const file = "avipack.config.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "CONFIG_INVALID", "Config must be a YAML object.")) return;

  requireRecord(source.project, issues, file, "project", "CONFIG_PROJECT_INVALID", "Config project must be an object.");
  if (isRecord(source.project)) {
    requireString(source.project.name, issues, file, "project.name", "CONFIG_PROJECT_NAME_REQUIRED", "Config project.name is required.");
    optionalString(source.project.id, issues, file, "project.id", "CONFIG_PROJECT_ID_INVALID", "Config project.id must be a string.");
    optionalString(
      source.project.template,
      issues,
      file,
      "project.template",
      "CONFIG_PROJECT_TEMPLATE_INVALID",
      "Config project.template must be a string."
    );
    optionalEnum(source.project.mode, ["init", "adopt"], issues, file, "project.mode", "CONFIG_PROJECT_MODE_INVALID", "Config project.mode must be init or adopt.");
  }

  requireRecord(source.brain, issues, file, "brain", "CONFIG_BRAIN_INVALID", "Config brain must be an object.");
  if (isRecord(source.brain)) {
    requireString(source.brain.root, issues, file, "brain.root", "CONFIG_BRAIN_ROOT_REQUIRED", "Config brain.root is required.");
    requireString(source.brain.path, issues, file, "brain.path", "CONFIG_BRAIN_PATH_REQUIRED", "Config brain.path is required.");
  }

  requireRecord(source.bots, issues, file, "bots", "CONFIG_BOTS_INVALID", "Config bots must be an object.");
  if (isRecord(source.bots)) {
    requireStringArray(source.bots.installed, issues, file, "bots.installed", "CONFIG_BOTS_INSTALLED_INVALID", "Config bots.installed must be a list of strings.");
    requireStringArray(source.bots.enabled, issues, file, "bots.enabled", "CONFIG_BOTS_ENABLED_INVALID", "Config bots.enabled must be a list of strings.");

    const installed = new Set(arrayOfStrings(source.bots.installed));
    const knownBotIds = new Set(listKnownBots().map((bot) => bot.id));
    for (const botId of [...arrayOfStrings(source.bots.installed), ...arrayOfStrings(source.bots.enabled)]) {
      if (!knownBotIds.has(botId)) {
        issues.push({
          code: "CONFIG_UNKNOWN_BOT",
          severity: "error",
          message: `Config references unknown bot ID: ${botId}`,
          file,
          path: "bots"
        });
      }
    }

    for (const enabledBot of arrayOfStrings(source.bots.enabled)) {
      if (!installed.has(enabledBot)) {
        issues.push({
          code: "CONFIG_ENABLED_BOT_NOT_INSTALLED",
          severity: "error",
          message: `Config enables bot that is not installed: ${enabledBot}`,
          file,
          path: "bots.enabled"
        });
      }
    }
  }
}

function validateProject(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/project.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "PROJECT_INVALID", "Project brain file must be a YAML object.")) return;

  requireRecord(source.project, issues, file, "project", "PROJECT_METADATA_INVALID", "project must be an object.");
  if (isRecord(source.project)) {
    requireString(source.project.id, issues, file, "project.id", "PROJECT_ID_REQUIRED", "project.id is required.");
    requireString(source.project.name, issues, file, "project.name", "PROJECT_NAME_REQUIRED", "project.name is required.");
    requireString(source.project.version, issues, file, "project.version", "PROJECT_VERSION_REQUIRED", "project.version is required.");
    requireString(source.project.type, issues, file, "project.type", "PROJECT_TYPE_REQUIRED", "project.type is required.");
    requireRecord(source.project.stack, issues, file, "project.stack", "PROJECT_STACK_INVALID", "project.stack must be an object.");
  }

  requireRecord(source.governance, issues, file, "governance", "PROJECT_GOVERNANCE_INVALID", "governance must be an object.");
}

function validateRequirements(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/requirements.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "REQUIREMENTS_INVALID", "Requirements file must be a YAML object.")) return;
  if (!requireArray(source.requirements, issues, file, "requirements", "REQUIREMENTS_LIST_INVALID", "requirements must be a list.")) return;

  const seen = new Set<string>();
  for (const [index, requirement] of source.requirements.entries()) {
    const path = `requirements.${index}`;
    if (!expectRecord(requirement, issues, file, path, "REQUIREMENT_INVALID", "Each requirement must be an object.")) continue;

    if (requireString(requirement.id, issues, file, `${path}.id`, "REQUIREMENT_ID_REQUIRED", "Requirement id is required.")) {
      if (!/^REQ-\d{3,}$/.test(requirement.id)) {
        addError(issues, file, `${path}.id`, "REQUIREMENT_ID_INVALID", `Requirement ID must match REQ-0001 style: ${requirement.id}`);
      }
      if (seen.has(requirement.id)) {
        addError(issues, file, `${path}.id`, "REQUIREMENT_ID_DUPLICATE", `Duplicate requirement ID: ${requirement.id}`);
      }
      seen.add(requirement.id);
    }

    requireString(requirement.title, issues, file, `${path}.title`, "REQUIREMENT_TITLE_REQUIRED", "Requirement title is required.");
    requireString(requirement.statement, issues, file, `${path}.statement`, "REQUIREMENT_STATEMENT_REQUIRED", "Requirement statement is required.");
    requireEnum(
      requirement.status,
      requirementStatuses,
      issues,
      file,
      `${path}.status`,
      "REQUIREMENT_STATUS_INVALID",
      "Requirement status must be one of: proposed, approved, in_progress, done, rejected, deferred."
    );
    requireEnum(
      requirement.priority,
      requirementPriorities,
      issues,
      file,
      `${path}.priority`,
      "REQUIREMENT_PRIORITY_INVALID",
      "Requirement priority must be one of: low, medium, high, critical."
    );
    if (!Number.isInteger(requirement.version) || Number(requirement.version) < 1) {
      addError(issues, file, `${path}.version`, "REQUIREMENT_VERSION_INVALID", "Requirement version must be a positive integer.");
    }
    requireRecord(requirement.traces, issues, file, `${path}.traces`, "REQUIREMENT_TRACES_REQUIRED", "Requirement traces must exist.");
    if (isRecord(requirement.traces)) {
      optionalStringArray(requirement.traces.architecture, issues, file, `${path}.traces.architecture`, "REQUIREMENT_TRACES_ARCHITECTURE_INVALID", "Requirement traces.architecture must be a list of strings.");
      optionalStringArray(requirement.traces.tests, issues, file, `${path}.traces.tests`, "REQUIREMENT_TRACES_TESTS_INVALID", "Requirement traces.tests must be a list of strings.");
      optionalStringArray(requirement.traces.changes, issues, file, `${path}.traces.changes`, "REQUIREMENT_TRACES_CHANGES_INVALID", "Requirement traces.changes must be a list of strings.");
      optionalStringArray(requirement.traces.decisions, issues, file, `${path}.traces.decisions`, "REQUIREMENT_TRACES_DECISIONS_INVALID", "Requirement traces.decisions must be a list of strings.");
    }
  }
}

function validateArchitecture(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/architecture.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "ARCHITECTURE_INVALID", "Architecture file must be a YAML object.")) return;
  if (!requireRecord(source.architecture, issues, file, "architecture", "ARCHITECTURE_ROOT_REQUIRED", "architecture must be an object.")) return;
  if (!isRecord(source.architecture)) return;
  if (!requireArray(source.architecture.components, issues, file, "architecture.components", "ARCHITECTURE_COMPONENTS_INVALID", "architecture.components must be a list.")) return;

  const seen = new Set<string>();
  for (const [index, component] of source.architecture.components.entries()) {
    const path = `architecture.components.${index}`;
    if (!expectRecord(component, issues, file, path, "ARCHITECTURE_COMPONENT_INVALID", "Each architecture component must be an object.")) continue;
    if (requireString(component.id, issues, file, `${path}.id`, "ARCHITECTURE_ID_REQUIRED", "Architecture component id is required.")) {
      if (seen.has(component.id)) {
        addError(issues, file, `${path}.id`, "ARCHITECTURE_ID_DUPLICATE", `Duplicate architecture ID: ${component.id}`);
      }
      seen.add(component.id);
    }
    requireString(component.name, issues, file, `${path}.name`, "ARCHITECTURE_NAME_REQUIRED", "Architecture component name is required.");
    requireString(component.type, issues, file, `${path}.type`, "ARCHITECTURE_TYPE_REQUIRED", "Architecture component type is required.");
    requireString(component.description, issues, file, `${path}.description`, "ARCHITECTURE_DESCRIPTION_REQUIRED", "Architecture component description is required.");
    optionalStringArray(component.responsibilities, issues, file, `${path}.responsibilities`, "ARCHITECTURE_RESPONSIBILITIES_INVALID", "Architecture responsibilities must be a list of strings.");
    optionalStringArray(component.related_requirements, issues, file, `${path}.related_requirements`, "ARCHITECTURE_RELATED_REQUIREMENTS_INVALID", "Architecture related_requirements must be a list of strings.");
  }
}

function validateTestingStrategy(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/testing-strategy.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "TESTING_INVALID", "Testing strategy file must be a YAML object.")) return;
  if (!requireRecord(source.testing, issues, file, "testing", "TESTING_ROOT_REQUIRED", "testing must be an object.")) return;
  if (!isRecord(source.testing)) return;
  requireString(source.testing.strategy, issues, file, "testing.strategy", "TESTING_STRATEGY_REQUIRED", "testing.strategy is required.");
  if (!requireArray(source.testing.test_cases, issues, file, "testing.test_cases", "TESTING_CASES_INVALID", "testing.test_cases must be a list.")) return;

  const seen = new Set<string>();
  for (const [index, testCase] of source.testing.test_cases.entries()) {
    const path = `testing.test_cases.${index}`;
    if (!expectRecord(testCase, issues, file, path, "TEST_CASE_INVALID", "Each test case must be an object.")) continue;
    if (requireString(testCase.id, issues, file, `${path}.id`, "TEST_ID_REQUIRED", "Test case id is required.")) {
      if (seen.has(testCase.id)) {
        addError(issues, file, `${path}.id`, "TEST_ID_DUPLICATE", `Duplicate test ID: ${testCase.id}`);
      }
      seen.add(testCase.id);
    }
    requireString(testCase.title, issues, file, `${path}.title`, "TEST_TITLE_REQUIRED", "Test case title is required.");
    requireString(testCase.type, issues, file, `${path}.type`, "TEST_TYPE_REQUIRED", "Test case type is required.");
    requireStringArray(testCase.related_requirements, issues, file, `${path}.related_requirements`, "TEST_RELATED_REQUIREMENTS_INVALID", "Test related_requirements must be a list of strings.");
    optionalString(testCase.command, issues, file, `${path}.command`, "TEST_COMMAND_INVALID", "Test command must be a string.");
  }
}

function validateDomainModel(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/domain-model.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "DOMAIN_MODEL_INVALID", "Domain model file must be a YAML object.")) return;
  requireArray(source.entities, issues, file, "entities", "DOMAIN_ENTITIES_INVALID", "entities must be a list.");
  requireArray(source.relationships, issues, file, "relationships", "DOMAIN_RELATIONSHIPS_INVALID", "relationships must be a list.");
}

function validateSecurityRules(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/security-rules.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "SECURITY_RULES_INVALID", "Security rules file must be a YAML object.")) return;
  requireRecord(source.rules, issues, file, "rules", "SECURITY_RULES_ROOT_INVALID", "rules must be an object.");
}

function validateGlossary(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/glossary.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "GLOSSARY_INVALID", "Glossary file must be a YAML object.")) return;
  requireRecord(source.terms, issues, file, "terms", "GLOSSARY_TERMS_INVALID", "terms must be an object.");
}

function validateSprintLock(source: unknown, issues: ValidationIssue[]): void {
  const file = ".avipack/brain/sprint-lock.yaml";
  if (!source) return;
  if (!expectRecord(source, issues, file, "$", "SPRINT_LOCK_INVALID", "Sprint lock file must be a YAML object.")) return;
  if (!requireRecord(source.sprint_lock, issues, file, "sprint_lock", "SPRINT_LOCK_ROOT_REQUIRED", "sprint_lock must be an object.")) return;
  if (!isRecord(source.sprint_lock)) return;

  requireEnum(source.sprint_lock.status, sprintLockStatuses, issues, file, "sprint_lock.status", "SPRINT_LOCK_STATUS_INVALID", "Sprint lock status must be locked or unlocked.");
  if (source.sprint_lock.status === "locked" && !isNonEmptyString(source.sprint_lock.active_sprint)) {
    addError(issues, file, "sprint_lock.active_sprint", "SPRINT_LOCK_ACTIVE_SPRINT_REQUIRED", "Sprint lock active_sprint is required when status is locked.");
  } else if (source.sprint_lock.active_sprint !== null && source.sprint_lock.active_sprint !== undefined && !isString(source.sprint_lock.active_sprint)) {
    addError(issues, file, "sprint_lock.active_sprint", "SPRINT_LOCK_ACTIVE_SPRINT_INVALID", "Sprint lock active_sprint must be a string or null.");
  }
  requireStringArray(source.sprint_lock.locked_requirements, issues, file, "sprint_lock.locked_requirements", "SPRINT_LOCK_REQUIREMENTS_INVALID", "locked_requirements must be a list of strings.");
  requireStringArray(source.sprint_lock.locked_architecture, issues, file, "sprint_lock.locked_architecture", "SPRINT_LOCK_ARCHITECTURE_INVALID", "locked_architecture must be a list of strings.");
  requireStringArray(source.sprint_lock.locked_tests, issues, file, "sprint_lock.locked_tests", "SPRINT_LOCK_TESTS_INVALID", "locked_tests must be a list of strings.");
  requireStringArray(source.sprint_lock.notes, issues, file, "sprint_lock.notes", "SPRINT_LOCK_NOTES_INVALID", "sprint_lock.notes must be a list of strings.");
}

function validateCrossReferences(cwd: string, parsedYaml: Map<string, unknown>, issues: ValidationIssue[]): void {
  const requirements = parsedYaml.get(".avipack/brain/requirements.yaml");
  const architecture = parsedYaml.get(".avipack/brain/architecture.yaml");
  const testing = parsedYaml.get(".avipack/brain/testing-strategy.yaml");
  const sprintLock = parsedYaml.get(".avipack/brain/sprint-lock.yaml");
  const requirementIds = new Set(getRequirementIds(requirements));
  const architectureIds = new Set(getArchitectureIds(architecture));
  const testIds = new Set(getTestIds(testing));

  if (isRecord(requirements) && Array.isArray(requirements.requirements)) {
    for (const requirement of requirements.requirements) {
      if (!isRecord(requirement) || !isString(requirement.id) || !isRecord(requirement.traces)) continue;

      for (const architectureId of arrayOfStrings(requirement.traces.architecture)) {
        if (!architectureIds.has(architectureId)) {
          addWarning(issues, ".avipack/brain/requirements.yaml", "requirements.traces.architecture", "TRACE_UNKNOWN_ARCHITECTURE", `${requirement.id} traces unknown architecture ID: ${architectureId}`);
        }
      }
      for (const testId of arrayOfStrings(requirement.traces.tests)) {
        if (!testIds.has(testId)) {
          addWarning(issues, ".avipack/brain/requirements.yaml", "requirements.traces.tests", "TRACE_UNKNOWN_TEST", `${requirement.id} traces unknown test ID: ${testId}`);
        }
      }
      for (const changeId of arrayOfStrings(requirement.traces.changes)) {
        if (!changeExists(cwd, changeId)) {
          addWarning(issues, ".avipack/brain/requirements.yaml", "requirements.traces.changes", "TRACE_UNKNOWN_CHANGE", `${requirement.id} traces unknown change request: ${changeId}`);
        }
      }
      for (const decisionId of arrayOfStrings(requirement.traces.decisions)) {
        if (!decisionExists(cwd, decisionId)) {
          addWarning(issues, ".avipack/brain/requirements.yaml", "requirements.traces.decisions", "TRACE_UNKNOWN_DECISION", `${requirement.id} traces unknown decision: ${decisionId}`);
        }
      }
    }
  }

  if (isRecord(architecture) && isRecord(architecture.architecture) && Array.isArray(architecture.architecture.components)) {
    for (const component of architecture.architecture.components) {
      if (!isRecord(component) || !isString(component.id)) continue;
      for (const requirementId of arrayOfStrings(component.related_requirements)) {
        if (!requirementIds.has(requirementId)) {
          addWarning(issues, ".avipack/brain/architecture.yaml", "architecture.components.related_requirements", "ARCHITECTURE_UNKNOWN_REQUIREMENT", `${component.id} references unknown requirement ID: ${requirementId}`);
        }
      }
    }
  }

  if (isRecord(testing) && isRecord(testing.testing) && Array.isArray(testing.testing.test_cases)) {
    for (const testCase of testing.testing.test_cases) {
      if (!isRecord(testCase) || !isString(testCase.id)) continue;
      for (const requirementId of arrayOfStrings(testCase.related_requirements)) {
        if (!requirementIds.has(requirementId)) {
          addWarning(issues, ".avipack/brain/testing-strategy.yaml", "testing.test_cases.related_requirements", "TEST_UNKNOWN_REQUIREMENT", `${testCase.id} references unknown requirement ID: ${requirementId}`);
        }
      }
    }
  }

  if (isRecord(sprintLock) && isRecord(sprintLock.sprint_lock)) {
    for (const requirementId of arrayOfStrings(sprintLock.sprint_lock.locked_requirements)) {
      if (!requirementIds.has(requirementId)) {
        addError(issues, ".avipack/brain/sprint-lock.yaml", "sprint_lock.locked_requirements", "SPRINT_LOCK_UNKNOWN_REQUIREMENT", `Sprint lock references unknown requirement ID: ${requirementId}`);
      }
    }
  }
}

function getRequirementIds(source: unknown): string[] {
  if (!isRecord(source) || !Array.isArray(source.requirements)) return [];
  return source.requirements.map((requirement) => (isRecord(requirement) ? requirement.id : undefined)).filter(isString);
}

function getArchitectureIds(source: unknown): string[] {
  if (!isRecord(source) || !isRecord(source.architecture) || !Array.isArray(source.architecture.components)) return [];
  return source.architecture.components.map((component) => (isRecord(component) ? component.id : undefined)).filter(isString);
}

function getTestIds(source: unknown): string[] {
  if (!isRecord(source) || !isRecord(source.testing) || !Array.isArray(source.testing.test_cases)) return [];
  return source.testing.test_cases.map((testCase) => (isRecord(testCase) ? testCase.id : undefined)).filter(isString);
}

function changeExists(cwd: string, changeId: string): boolean {
  return recordExists(join(cwd, ".avipack/changes"), changeId);
}

function decisionExists(cwd: string, decisionId: string): boolean {
  return recordExists(join(cwd, ".avipack/decisions"), decisionId);
}

function recordExists(dir: string, id: string): boolean {
  if (!existsSync(dir)) return false;
  try {
    return readdirSync(dir).some((file) => file.startsWith(`${id}-`) && file.endsWith(".md"));
  } catch {
    return false;
  }
}

function canWriteBrainCheckReport(cwd: string): boolean {
  return existsSync(join(cwd, ".avipack"));
}

function writeBrainCheckReport(cwd: string, result: BrainCheckResult): void {
  mkdirSync(join(cwd, ".avipack/reports"), { recursive: true });
  writeFileSync(
    join(cwd, ".avipack/reports/brain-check.md"),
    `# Avipack Brain Check

## Summary
- Status: ${result.passed ? "passed" : "failed"}
- Files Checked: ${result.checkedFiles.length}
- Errors: ${result.errors.length}
- Warnings: ${result.warnings.length}

## Missing Files
${renderList(result.missingFiles)}

## Errors
${renderList(result.errors)}

## Warnings
${renderList(result.warnings)}
`
  );
}

function renderList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function expectRecord(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): value is Record<string, unknown> {
  if (isRecord(value)) return true;
  addError(issues, file, path, code, message);
  return false;
}

function requireRecord(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): boolean {
  if (isRecord(value)) return true;
  addError(issues, file, path, code, message);
  return false;
}

function requireArray(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): value is unknown[] {
  if (Array.isArray(value)) return true;
  addError(issues, file, path, code, message);
  return false;
}

function requireString(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): value is string {
  if (isNonEmptyString(value)) return true;
  addError(issues, file, path, code, message);
  return false;
}

function optionalString(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  if (value === undefined || isString(value)) return;
  addError(issues, file, path, code, message);
}

function requireStringArray(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): boolean {
  if (Array.isArray(value) && value.every(isString)) return true;
  addError(issues, file, path, code, message);
  return false;
}

function optionalStringArray(value: unknown, issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  if (value === undefined || (Array.isArray(value) && value.every(isString))) return;
  addError(issues, file, path, code, message);
}

function requireEnum(value: unknown, allowed: Set<string>, issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  if (isString(value) && allowed.has(value)) return;
  addError(issues, file, path, code, message);
}

function optionalEnum(value: unknown, allowed: string[], issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  if (value === undefined || (isString(value) && allowed.includes(value))) return;
  addError(issues, file, path, code, message);
}

function addError(issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  issues.push({ code, severity: "error", message, file, path });
}

function addWarning(issues: ValidationIssue[], file: string, path: string, code: string, message: string): void {
  issues.push({ code, severity: "warning", message, file, path });
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}
