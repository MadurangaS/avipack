import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = resolve("packages/cli/dist/index.js");

async function tempProject(prefix = "avipack-cli-") {
  return mkdtemp(join(tmpdir(), prefix));
}

async function runCli(args, cwd) {
  return execFileAsync("node", [cliPath, ...args], { cwd });
}

test("avipack --help works", async () => {
  const { stdout } = await runCli(["--help"], process.cwd());
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /avipack/);
});

test("avipack init --name TestApp creates files in temp directory", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "TestApp"], cwd);

  assert.equal(existsSync(join(cwd, ".avipack")), true);
  assert.equal(existsSync(join(cwd, "avipack.config.yaml")), true);
});

test("avipack bot add brain updates config", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "BotCliApp"], cwd);
  await runCli(["bot", "add", "brain"], cwd);

  const config = await readFile(join(cwd, "avipack.config.yaml"), "utf8");
  assert.match(config, /installed:/);
  assert.match(config, /avipack\.bot\.brain/);
});

test("avipack bot enable brain updates config", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "EnableCliApp"], cwd);
  await runCli(["bot", "add", "brain"], cwd);
  await runCli(["bot", "enable", "brain"], cwd);

  const config = await readFile(join(cwd, "avipack.config.yaml"), "utf8");
  assert.match(config, /enabled:/);
  assert.match(config, /avipack\.bot\.brain/);
});

test("avipack bot run brain --dry-run does not write", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "RunDryCliApp"], cwd);
  await runCli(["bot", "add", "brain", "--enable"], cwd);
  const { stdout } = await runCli(["bot", "run", "brain", "--dry-run"], cwd);

  assert.match(stdout, /dry run/);
});

test("avipack change new creates CR-0002 file", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "ChangeCliApp"], cwd);
  await runCli(["change", "new", "--title", "Add Login"], cwd);

  assert.equal(existsSync(join(cwd, ".avipack/changes/CR-0002-add-login.md")), true);
});

test("avipack adr new creates ADR-0002 file", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "AdrCliApp"], cwd);
  await runCli(["adr", "new", "--title", "Use PostgreSQL"], cwd);

  assert.equal(existsSync(join(cwd, ".avipack/decisions/ADR-0002-use-postgresql.md")), true);
});

test("avipack brain check passes after init", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "BrainCliApp"], cwd);
  const { stdout } = await runCli(["brain", "check"], cwd);

  assert.match(stdout, /Status: passed/);
});
