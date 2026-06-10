import type { BotManifest } from "../plugins/botManifest.js";
import { validateSafeBotWritePath } from "./safe-bot-writes.js";

export function isAllowedAvipackWritePath(targetDir: string, plannedPath: string): boolean {
  return validateSafeBotWritePath(targetDir, plannedPath).ok;
}

export function canWriteBotReport(targetDir: string, plannedPath: string): boolean {
  const result = validateSafeBotWritePath(targetDir, plannedPath);
  return Boolean(result.ok && result.relativePath?.startsWith(".avipack/reports/bots/"));
}

export function describeBotPermissions(bot: BotManifest): string {
  return `Read: ${bot.permissions.read.join(", ")}\nWrite: ${bot.permissions.write.join(", ")}`;
}
