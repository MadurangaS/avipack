import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, mkdir, cp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const releaseDir = join(root, ".release");
const coreDir = join(root, "packages/core");
const cliDir = join(root, "packages/cli");
const forbiddenPackageEntries = [
  "node_modules/",
  ".pnpm-store/",
  "__MACOSX/",
  ".DS_Store",
  "coverage/",
  ".git/"
];

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

const corePackage = JSON.parse(await readFile(join(coreDir, "package.json"), "utf8"));
const cliPackage = JSON.parse(await readFile(join(cliDir, "package.json"), "utf8"));

if (corePackage.version !== cliPackage.version) {
  throw new Error(`Core and CLI versions must match for local release packaging. core=${corePackage.version} cli=${cliPackage.version}`);
}

const coreTarball = await npmPack(coreDir, releaseDir);
await assertTarballClean(coreTarball);

const stagedCliDir = await mkdtemp(join(tmpdir(), "avipack-cli-release-"));
try {
  await cp(join(cliDir, "dist"), join(stagedCliDir, "dist"), { recursive: true });
  await cp(join(cliDir, "README.md"), join(stagedCliDir, "README.md"));

  const releaseCliPackage = {
    ...cliPackage,
    dependencies: {
      ...cliPackage.dependencies,
      [corePackage.name]: corePackage.version
    }
  };
  await writeFile(join(stagedCliDir, "package.json"), `${JSON.stringify(releaseCliPackage, null, 2)}\n`);

  const cliTarball = await npmPack(stagedCliDir, releaseDir);
  await assertTarballClean(cliTarball);
  await assertNoWorkspaceDependencies(cliTarball);

  const manifest = {
    version: cliPackage.version,
    generatedAt: new Date().toISOString(),
    artifacts: {
      core: relativeFromRoot(coreTarball),
      cli: relativeFromRoot(cliTarball)
    }
  };
  await writeFile(join(releaseDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Packed ${relativeFromRoot(coreTarball)}`);
  console.log(`Packed ${relativeFromRoot(cliTarball)}`);
} finally {
  await rm(stagedCliDir, { recursive: true, force: true });
}

async function npmPack(cwd, packDestination) {
  const { stdout } = await execFileAsync("npm", ["pack", "--pack-destination", packDestination, "--json"], {
    cwd,
    env: {
      ...process.env,
      npm_config_cache: join(tmpdir(), "avipack-npm-cache")
    }
  });
  const [packResult] = JSON.parse(stdout);
  if (!packResult?.filename) {
    throw new Error(`npm pack did not report an artifact for ${cwd}`);
  }
  return join(packDestination, basename(packResult.filename));
}

async function assertNoWorkspaceDependencies(tarball) {
  const packageJson = JSON.parse(await tarExtract(tarball, "package/package.json"));
  const dependencyEntries = [
    ...Object.entries(packageJson.dependencies ?? {}),
    ...Object.entries(packageJson.devDependencies ?? {}),
    ...Object.entries(packageJson.optionalDependencies ?? {}),
    ...Object.entries(packageJson.peerDependencies ?? {})
  ];
  const workspaceDependencies = dependencyEntries.filter(([, range]) => String(range).startsWith("workspace:"));

  if (workspaceDependencies.length > 0) {
    const names = workspaceDependencies.map(([name]) => name).join(", ");
    throw new Error(`${relativeFromRoot(tarball)} contains workspace dependencies: ${names}`);
  }
}

async function assertTarballClean(tarball) {
  const { stdout } = await execFileAsync("tar", ["-tf", tarball]);
  const entries = stdout.split("\n").filter(Boolean);
  const forbidden = entries.filter((entry) => {
    return forbiddenPackageEntries.some((forbiddenEntry) => entry.includes(forbiddenEntry));
  });

  if (forbidden.length > 0) {
    throw new Error(`${relativeFromRoot(tarball)} contains forbidden entries:\n${forbidden.join("\n")}`);
  }
}

async function tarExtract(tarball, path) {
  const { stdout } = await execFileAsync("tar", ["-xOf", tarball, path]);
  return stdout;
}

function relativeFromRoot(path) {
  return path.startsWith(root) ? path.slice(root.length + 1) : path;
}
