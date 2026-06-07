import { relative, resolve } from "node:path";
import type { BotManifest } from "../plugins/botManifest.js";

const allowedWritePrefixes = [
  ".avipack/reports/",
  ".avipack/brain/",
  ".avipack/changes/",
  ".avipack/decisions/"
];

export function isAllowedAvipackWritePath(targetDir: string, plannedPath: string): boolean {
  const relativePath = toPosixRelative(targetDir, plannedPath);
  return allowedWritePrefixes.some((prefix) => relativePath.startsWith(prefix));
}

export function canWriteBotReport(targetDir: string, plannedPath: string): boolean {
  const relativePath = toPosixRelative(targetDir, plannedPath);
  return relativePath.startsWith(".avipack/reports/");
}

export function describeBotPermissions(bot: BotManifest): string {
  return `Read: ${bot.permissions.read.join(", ")}\nWrite: ${bot.permissions.write.join(", ")}`;
}

function toPosixRelative(targetDir: string, plannedPath: string): string {
  return relative(resolve(targetDir), resolve(targetDir, plannedPath)).replaceAll("\\", "/");
}
