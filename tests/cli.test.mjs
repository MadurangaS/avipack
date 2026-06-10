import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
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

async function listRelativeFiles(root, relativeDir = ".") {
  const absoluteDir = join(root, relativeDir);
  if (!existsSync(absoluteDir)) {
    return [];
  }

  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = relativeDir === "." ? entry.name : `${relativeDir}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await listRelativeFiles(root, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files.sort();
}

async function runCli(args, cwd) {
  return execFileAsync("node", [cliPath, ...args], { cwd });
}

test("avipack --help works", async () => {
  const { stdout } = await runCli(["--help"], process.cwd());
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /avipack/);
});

test("avipack --help includes key commands", async () => {
  const { stdout } = await runCli(["--help"], process.cwd());

  for (const command of ["init", "adopt", "brain", "bot", "change", "adr", "doctor", "version"]) {
    assert.match(stdout, new RegExp(`\\b${command}\\b`));
  }
});

test("avipack --version prints product version", async () => {
  const { stdout } = await runCli(["--version"], process.cwd());
  assert.match(stdout.trim(), /^avipack \d+\.\d+\.\d+$/);
});

test("avipack version prints product version", async () => {
  const { stdout } = await runCli(["version"], process.cwd());
  assert.match(stdout.trim(), /^avipack \d+\.\d+\.\d+$/);
});

test("avipack doctor outside Avipack project works", async () => {
  const cwd = await tempProject();
  const { stdout } = await runCli(["doctor"], cwd);

  assert.match(stdout, /Avipack Doctor/);
  assert.match(stdout, /Avipack project: no/);
  assert.match(stdout, /Result: healthy/);
});

test("avipack doctor inside Avipack project works", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "DoctorCliApp"], cwd);
  const { stdout } = await runCli(["doctor"], cwd);

  assert.match(stdout, /Avipack project: yes/);
  assert.match(stdout, /Brain files: ok/);
  assert.match(stdout, /Result: healthy/);
});

test("avipack doctor --json works", async () => {
  const cwd = await tempProject();
  const { stdout } = await runCli(["doctor", "--json"], cwd);
  const parsed = JSON.parse(stdout);

  assert.equal(typeof parsed.healthy, "boolean");
  assert.equal(parsed.project.isAvipackProject, false);
  assert.equal(parsed.runtime.node, process.version);
});

test("CLI package metadata has valid bin entry", async () => {
  const packageJson = JSON.parse(await readFile(resolve("packages/cli/package.json"), "utf8"));

  assert.equal(packageJson.bin.avipack, "dist/index.js");
  assert.equal(packageJson.type, "module");
  assert.ok(packageJson.files.includes("dist"));
});

test("CLI package dry-run pack excludes unrelated generated folders", async () => {
  const npmCache = await tempProject("avipack-npm-cache-");
  const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json"], {
    cwd: resolve("packages/cli"),
    env: { ...process.env, npm_config_cache: npmCache }
  });
  const [packResult] = JSON.parse(stdout);
  const files = packResult.files.map((file) => file.path);

  assert.ok(files.includes("dist/index.js"));
  assert.ok(files.includes("package.json"));
  assert.equal(files.some((file) => file.includes(".pnpm-store")), false);
  assert.equal(files.some((file) => file.includes("coverage/")), false);
  assert.equal(files.some((file) => file.includes("__MACOSX")), false);
  assert.equal(files.some((file) => file.includes(".DS_Store")), false);
  assert.equal(files.some((file) => file.startsWith("../")), false);
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

test("avipack bot add brain --enable after install enables it", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "AddEnableCliApp"], cwd);
  await runCli(["bot", "add", "brain"], cwd);
  const { stdout } = await runCli(["bot", "add", "brain", "--enable"], cwd);

  const config = await readFile(join(cwd, "avipack.config.yaml"), "utf8");
  assert.match(stdout, /enabled by explicit flag/);
  assert.match(config, /enabled:\n\s+- avipack\.bot\.brain/);
});

test("avipack bot disable brain before install fails cleanly", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "DisableBeforeInstallCliApp"], cwd);

  await assert.rejects(
    () => runCli(["bot", "disable", "brain"], cwd),
    (error) => {
      assert.match(error.stderr, /AviBrain is not installed/);
      return true;
    }
  );
});

test("avipack bot run brain --dry-run does not write", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "RunDryCliApp"], cwd);
  await runCli(["bot", "add", "brain", "--enable"], cwd);
  const beforeFiles = await listRelativeFiles(cwd);
  const { stdout } = await runCli(["bot", "run", "brain", "--dry-run"], cwd);
  const afterFiles = await listRelativeFiles(cwd);

  assert.match(stdout, /Avipack Bot Run/);
  assert.match(stdout, /Mode: dry-run/);
  assert.match(stdout, /Files written: 0/);
  assert.deepEqual(afterFiles, beforeFiles);
});

test("avipack bot run brain --apply writes approved artifacts", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "RunApplyCliApp"], cwd);
  await runCli(["bot", "add", "brain", "--enable"], cwd);
  const { stdout } = await runCli(["bot", "run", "brain", "--apply"], cwd);

  assert.match(stdout, /Mode: apply/);
  assert.match(stdout, /Files written: 2/);
  assert.equal(existsSync(join(cwd, ".avipack/reports/bots")), true);
  assert.equal(existsSync(join(cwd, ".avipack/drafts")), true);
});

test("avipack bot run rejects dry-run and apply together", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "RunConflictCliApp"], cwd);
  await runCli(["bot", "add", "brain", "--enable"], cwd);

  await assert.rejects(
    () => runCli(["bot", "run", "brain", "--dry-run", "--apply"], cwd),
    (error) => {
      assert.match(error.stderr, /Use either --dry-run or --apply, not both/);
      return true;
    }
  );
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

test("avipack brain check --json returns validation report", async () => {
  const cwd = await tempProject();
  await runCli(["init", "--name", "BrainJsonCliApp"], cwd);
  const { stdout } = await runCli(["brain", "check", "--json"], cwd);
  const parsed = JSON.parse(stdout);

  assert.equal(parsed.passed, true);
  assert.equal(parsed.validationReport.ok, true);
  assert.equal(Array.isArray(parsed.validationReport.errors), true);
  assert.equal(Array.isArray(parsed.validationReport.warnings), true);
});

test("avipack brain check --report outside project does not create .avipack", async () => {
  const cwd = await tempProject();

  await assert.rejects(
    () => runCli(["brain", "check", "--report"], cwd),
    (error) => {
      assert.match(error.stdout, /Report was not written because this is not an Avipack project/);
      return true;
    }
  );
  assert.equal(existsSync(join(cwd, ".avipack")), false);
});
