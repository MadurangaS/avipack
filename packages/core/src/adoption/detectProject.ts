import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

export type DetectedProject = {
  name: string;
  language: string;
  framework: string;
  database: string;
  packageManager?: string;
  detectedFiles: string[];
};

const detectionFiles = [
  "package.json",
  "tsconfig.json",
  "pyproject.toml",
  "requirements.txt",
  "pom.xml",
  "build.gradle",
  "go.mod",
  "Cargo.toml",
  "composer.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  "bun.lockb",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.ts",
  "angular.json",
  "src/main.py",
  "prisma/schema.prisma",
  "alembic.ini"
];

export async function detectProject(targetDir = process.cwd(), projectName?: string): Promise<DetectedProject> {
  const root = resolve(targetDir);
  const detectedFiles = await collectDetectedFiles(root);

  return {
    name: projectName ?? basename(root),
    language: detectLanguage(root),
    framework: await detectFramework(root),
    database: await detectDatabase(root),
    packageManager: detectPackageManager(root),
    detectedFiles
  };
}

async function collectDetectedFiles(root: string): Promise<string[]> {
  const detected = detectionFiles.filter((relativePath) => existsSync(join(root, relativePath)));
  const dynamicPatterns = [
    await matchingRootFiles(root, /^nuxt\.config\./),
    await matchingRootFiles(root, /^svelte\.config\./),
    await matchingRootFiles(root, /^drizzle\.config\./),
    await matchingRootFiles(root, /^ormconfig\./),
    await matchingRootFiles(root, /^data-source\./)
  ];

  return [...detected, ...dynamicPatterns.flat()].sort();
}

function detectLanguage(root: string): string {
  if (existsSync(join(root, "tsconfig.json"))) {
    return "TypeScript";
  }

  if (existsSync(join(root, "package.json"))) {
    return "JavaScript/TypeScript";
  }

  if (existsSync(join(root, "pyproject.toml")) || existsSync(join(root, "requirements.txt"))) {
    return "Python";
  }

  if (existsSync(join(root, "pom.xml"))) {
    return "Java";
  }

  if (existsSync(join(root, "build.gradle"))) {
    return "Java/Kotlin/Gradle";
  }

  if (existsSync(join(root, "go.mod"))) {
    return "Go";
  }

  if (existsSync(join(root, "Cargo.toml"))) {
    return "Rust";
  }

  if (existsSync(join(root, "composer.json"))) {
    return "PHP";
  }

  return "unknown";
}

async function detectFramework(root: string): Promise<string> {
  if (hasAny(root, ["next.config.js", "next.config.mjs", "next.config.ts"])) {
    return "Next.js";
  }

  if (hasAny(root, ["vite.config.js", "vite.config.ts"])) {
    return "Vite";
  }

  if (existsSync(join(root, "angular.json"))) {
    return "Angular";
  }

  if ((await matchingRootFiles(root, /^nuxt\.config\./)).length > 0) {
    return "Nuxt";
  }

  if ((await matchingRootFiles(root, /^svelte\.config\./)).length > 0) {
    return "SvelteKit/Svelte";
  }

  if (existsSync(join(root, "src/main.py")) && existsSync(join(root, "requirements.txt"))) {
    return "Python app, unknown framework";
  }

  return "unknown";
}

async function detectDatabase(root: string): Promise<string> {
  if ((await matchingRootFiles(root, /^drizzle\.config\./)).length > 0) {
    return "Drizzle ORM";
  }

  if (existsSync(join(root, "prisma/schema.prisma"))) {
    return "Prisma";
  }

  if ((await matchingRootFiles(root, /^ormconfig\./)).length > 0 || (await matchingRootFiles(root, /^data-source\./)).length > 0) {
    return "TypeORM";
  }

  if (existsSync(join(root, "alembic.ini"))) {
    return "SQLAlchemy/Alembic";
  }

  return "unknown";
}

function detectPackageManager(root: string): string | undefined {
  if (existsSync(join(root, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (existsSync(join(root, "yarn.lock"))) {
    return "yarn";
  }

  if (existsSync(join(root, "package-lock.json"))) {
    return "npm";
  }

  if (existsSync(join(root, "bun.lockb"))) {
    return "bun";
  }

  return undefined;
}

function hasAny(root: string, relativePaths: string[]): boolean {
  return relativePaths.some((relativePath) => existsSync(join(root, relativePath)));
}

async function matchingRootFiles(root: string, pattern: RegExp): Promise<string[]> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && pattern.test(entry.name)).map((entry) => entry.name);
  } catch {
    return [];
  }
}
