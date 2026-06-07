import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
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
