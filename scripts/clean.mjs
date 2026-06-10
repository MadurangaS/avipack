import { rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const generatedPaths = ["coverage", ".release", "__MACOSX"];
const packageRoot = "packages";

if (existsSync(packageRoot)) {
  for (const entry of await readdir(packageRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      generatedPaths.push(join(packageRoot, entry.name, "dist"));
    }
  }
}

for (const path of generatedPaths) {
  await rm(path, { recursive: true, force: true });
}

await removeTsBuildInfo(".");

async function removeTsBuildInfo(directory) {
  if (!existsSync(directory)) {
    return;
  }

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".pnpm-store") {
      continue;
    }

    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      await removeTsBuildInfo(path);
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith(".tsbuildinfo") || entry.name.endsWith(".tgz"))) {
      await rm(path, { force: true });
    }
  }
}
