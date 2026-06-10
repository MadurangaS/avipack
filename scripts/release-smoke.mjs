import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const releaseDir = join(root, ".release");
const manifestPath = join(releaseDir, "manifest.json");

if (!existsSync(manifestPath)) {
  throw new Error("Release manifest is missing. Run pnpm release:pack first.");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const coreTarball = resolve(root, manifest.artifacts.core);
const cliTarball = resolve(root, manifest.artifacts.cli);
const smokeRoot = await mkdtemp(join(tmpdir(), "avipack-release-smoke-"));
const installPrefix = join(smokeRoot, "install-prefix");
const projectDir = join(smokeRoot, "project");

try {
  await mkdir(projectDir, { recursive: true });

  await run("npm", ["install", "--prefix", installPrefix, "--no-audit", "--no-fund", coreTarball, cliTarball], {
    cwd: smokeRoot,
    env: {
      ...process.env,
      npm_config_cache: join(tmpdir(), "avipack-npm-cache")
    }
  });

  const installedCliPackage = JSON.parse(await readFile(join(installPrefix, "node_modules/avipack/package.json"), "utf8"));
  const coreRange = installedCliPackage.dependencies?.["@avipack/core"];
  if (!coreRange || String(coreRange).startsWith("workspace:")) {
    throw new Error(`Installed CLI has invalid @avipack/core dependency range: ${coreRange}`);
  }

  const avipackBin = join(installPrefix, "node_modules/.bin/avipack");
  await run(avipackBin, ["--help"], { cwd: smokeRoot });
  await run(avipackBin, ["init", "--name", "InstallSmoke"], { cwd: projectDir });
  await run(avipackBin, ["doctor"], { cwd: projectDir });
  await run(avipackBin, ["brain", "check"], { cwd: projectDir });

  console.log("Release smoke install passed.");
} finally {
  await rm(smokeRoot, { recursive: true, force: true });
}

async function run(command, args, options) {
  try {
    return await execFileAsync(command, args, {
      ...options,
      maxBuffer: 1024 * 1024 * 10
    });
  } catch (error) {
    const stdout = error && typeof error === "object" && "stdout" in error ? error.stdout : "";
    const stderr = error && typeof error === "object" && "stderr" in error ? error.stderr : "";
    throw new Error(`Command failed: ${command} ${args.join(" ")}\n${stdout}\n${stderr}`);
  }
}
