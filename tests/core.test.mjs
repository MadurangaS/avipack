import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import {
  addInstalledBot,
  adoptProject,
  BotNotInstalledError,
  checkBrain,
  createAdr,
  createBrain,
  createChangeRequest,
  disableBot,
  enableBot,
  getBotState,
  loadConfig,
  normalizeConfig,
  writeConfig
} from "../packages/core/dist/index.js";

async function tempProject(prefix = "avipack-core-") {
  return mkdtemp(join(tmpdir(), prefix));
}

test("createBrain creates required files", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "TestApp" });

  assert.equal(existsSync(join(cwd, ".avipack/brain/project.yaml")), true);
  assert.equal(existsSync(join(cwd, "avipack.config.yaml")), true);
  assert.equal(existsSync(join(cwd, "README.md")), true);
});

test("adoptProject dry-run does not write", async () => {
  const cwd = await tempProject();
  const result = await adoptProject({ targetDir: cwd, dryRun: true, projectName: "DryRunApp" });

  assert.equal(result.dryRun, true);
  assert.equal(existsSync(join(cwd, ".avipack")), false);
  assert.equal(existsSync(join(cwd, "avipack.config.yaml")), false);
});

test("adoptProject writes report", async () => {
  const cwd = await tempProject();
  const result = await adoptProject({ targetDir: cwd, projectName: "AdoptedApp" });

  assert.equal(existsSync(join(cwd, result.adoptionReportPath)), true);
});

test("config load and write preserves required config", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "ConfigApp" });

  const config = loadConfig(cwd);
  assert.ok(config);
  config.bots.installed.push("avipack.bot.brain");
  await writeConfig(cwd, config);

  const reloaded = loadConfig(cwd);
  assert.deepEqual(reloaded?.bots.installed, ["avipack.bot.brain"]);
  assert.deepEqual(reloaded?.bots.enabled, []);
});

test("config normalization treats legacy enabled bots as installed", () => {
  const config = normalizeConfig({
    project: { name: "LegacyApp" },
    brain: { root: ".avipack", path: ".avipack/brain" },
    bots: { enabled: ["avipack.bot.brain"] }
  });

  assert.deepEqual(config.bots.installed, ["avipack.bot.brain"]);
  assert.deepEqual(config.bots.enabled, ["avipack.bot.brain"]);
});

test("bot state install, enable, and disable works", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "BotApp" });

  await addInstalledBot("brain", { cwd });
  await enableBot("brain", { cwd });
  assert.deepEqual(getBotState(cwd), {
    installed: ["avipack.bot.brain"],
    enabled: ["avipack.bot.brain"]
  });

  await disableBot("brain", { cwd });
  assert.deepEqual(getBotState(cwd), {
    installed: ["avipack.bot.brain"],
    enabled: []
  });
});

test("bot add with enable enables an already installed disabled bot", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "BotEnableAddApp" });

  await addInstalledBot("brain", { cwd });
  const result = await addInstalledBot("brain", { cwd, enable: true });

  assert.equal(result.status, "already-installed-enabled");
  assert.deepEqual(getBotState(cwd), {
    installed: ["avipack.bot.brain"],
    enabled: ["avipack.bot.brain"]
  });

  const alreadyEnabled = await addInstalledBot("brain", { cwd, enable: true });
  assert.equal(alreadyEnabled.status, "already-installed-already-enabled");
});

test("bot disable before install fails cleanly", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "BotDisableBeforeInstallApp" });

  await assert.rejects(() => disableBot("brain", { cwd }), BotNotInstalledError);
});

test("brain check catches missing files", async () => {
  const cwd = await tempProject();
  const result = checkBrain(cwd);

  assert.equal(result.passed, false);
  assert.ok(result.missingFiles.length > 0);
  assert.ok(result.errors.length > 0);
});

test("valid generated brain passes structured validation", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "ValidBrainApp" });

  const result = checkBrain(cwd);

  assert.equal(result.passed, true);
  assert.equal(result.validationReport.ok, true);
  assert.deepEqual(result.validationReport.errors, []);
  assert.deepEqual(result.validationReport.warnings, []);
});

test("brain check report outside Avipack project does not create .avipack", async () => {
  const cwd = await tempProject();
  const result = checkBrain({ cwd, report: true });

  assert.equal(result.passed, false);
  assert.equal(result.reportWritten, false);
  assert.equal(existsSync(join(cwd, ".avipack")), false);
  assert.match(result.reportMessage ?? "", /Run avipack init first/);
});

test("brain check catches invalid YAML", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "InvalidYamlApp" });
  await writeFile(join(cwd, ".avipack/brain/requirements.yaml"), "requirements:\n  - id: [");

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Invalid YAML")));
});

test("brain check catches duplicate requirement IDs", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "DuplicateRequirementApp" });
  const requirementsPath = join(cwd, ".avipack/brain/requirements.yaml");
  const source = await readFile(requirementsPath, "utf8");
  await writeFile(requirementsPath, source.replace("REQ-002", "REQ-001"));

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Duplicate requirement ID: REQ-001")));
});

test("brain check detects unknown trace references", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "UnknownTraceApp" });
  const requirementsPath = join(cwd, ".avipack/brain/requirements.yaml");
  const source = await readFile(requirementsPath, "utf8");
  await writeFile(
    requirementsPath,
    source
      .replace("ARCH-001", "ARCH-999")
      .replace("TEST-001", "TEST-999")
      .replace("CR-0001", "CR-9999")
      .replace("ADR-0001", "ADR-9999")
  );

  const result = checkBrain(cwd);
  assert.equal(result.passed, true);
  assert.ok(result.warnings.some((warning) => warning.includes("unknown architecture ID: ARCH-999")));
  assert.ok(result.warnings.some((warning) => warning.includes("unknown test ID: TEST-999")));
  assert.ok(result.warnings.some((warning) => warning.includes("unknown change request: CR-9999")));
  assert.ok(result.warnings.some((warning) => warning.includes("unknown decision: ADR-9999")));
});

test("brain check catches invalid requirement status", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "InvalidStatusApp" });
  const requirementsPath = join(cwd, ".avipack/brain/requirements.yaml");
  const source = await readFile(requirementsPath, "utf8");
  await writeFile(requirementsPath, source.replace("status: approved", "status: accepted"));

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Requirement status must be one of")));
});

test("brain check catches invalid requirement priority", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "InvalidPriorityApp" });
  const requirementsPath = join(cwd, ".avipack/brain/requirements.yaml");
  const source = await readFile(requirementsPath, "utf8");
  await writeFile(requirementsPath, source.replace("priority: high", "priority: urgent"));

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Requirement priority must be one of")));
});

test("sprint lock unlocked passes validation", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "SprintUnlockedApp" });

  const result = checkBrain(cwd);
  assert.equal(result.passed, true);
});

test("sprint lock locked with missing requirement fails", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "SprintLockedApp" });
  await writeFile(
    join(cwd, ".avipack/brain/sprint-lock.yaml"),
    `sprint_lock:
  status: locked
  active_sprint: sprint-1
  locked_requirements:
    - REQ-999
  locked_architecture: []
  locked_tests: []
  notes: []
`
  );

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Sprint lock references unknown requirement ID: REQ-999")));
});

test("brain check detects enabled bot that is not installed", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "EnabledBotApp" });
  await writeFile(
    join(cwd, "avipack.config.yaml"),
    `project:
  name: EnabledBotApp

brain:
  root: .avipack
  path: .avipack/brain

bots:
  installed: []
  enabled:
    - avipack.bot.brain
`
  );

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Config enables bot that is not installed")));
});

test("brain check detects unknown bot IDs", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "UnknownBotApp" });
  await writeFile(
    join(cwd, "avipack.config.yaml"),
    `project:
  name: UnknownBotApp

brain:
  root: .avipack
  path: .avipack/brain

bots:
  installed:
    - avipack.bot.unknown
  enabled: []
`
  );

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Config references unknown bot ID: avipack.bot.unknown")));
});

test("brain check catches missing required generated file", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "MissingGeneratedFileApp" });
  await rm(join(cwd, ".avipack/brain/project.yaml"));

  const result = checkBrain(cwd);
  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => error.includes("Missing required file: .avipack/brain/project.yaml")));
});

test("change numbering works", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "ChangeApp" });

  const result = await createChangeRequest({ cwd, title: "Add Login" });
  assert.equal(result.path, ".avipack/changes/CR-0002-add-login.md");
  assert.equal(existsSync(join(cwd, result.path)), true);
});

test("ADR numbering works", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "AdrApp" });

  const result = await createAdr({ cwd, title: "Use PostgreSQL" });
  assert.equal(result.path, ".avipack/decisions/ADR-0002-use-postgresql.md");
  assert.equal(existsSync(join(cwd, result.path)), true);
});

test("generated change request includes supplied content", async () => {
  const cwd = await tempProject();
  await createBrain({ cwd, projectName: "ChangeContentApp" });

  const result = await createChangeRequest({
    cwd,
    title: "Improve Audit",
    summary: "Add more audit details.",
    requirements: ["REQ-001"]
  });
  const content = await readFile(join(cwd, result.path), "utf8");

  assert.match(content, /Add more audit details\./);
  assert.match(content, /REQ-001/);
});
