import type { BotManifest } from "./botManifest.js";

export const knownBots: BotManifest[] = [
  {
    id: "avipack.bot.brain",
    name: "AviBrain",
    packageName: "@avipack/bot-brain",
    version: "0.1.0",
    description: "Maintains project requirements, scope, glossary, and project memory.",
    permissions: {
      read: [".avipack/**", "docs/**"],
      write: [".avipack/brain/maintenance/**", ".avipack/tasks/**", ".avipack/checklists/**", ".avipack/reports/bots/**"]
    },
    supportsApply: true,
    allowedActions: ["inspect-brain", "plan-maintenance", "write-avipack-artifacts"],
    blockedActions: ["modify-source-code", "call-external-ai", "install-packages", "run-autonomously"]
  },
  {
    id: "avipack.bot.architect",
    name: "AviArchitect",
    packageName: "@avipack/bot-architect",
    version: "0.1.0",
    description: "Reviews architecture, ADRs, module boundaries, and impact analysis.",
    permissions: {
      read: [".avipack/**", "docs/**", "packages/**", "src/**"],
      write: [".avipack/decisions/drafts/**", ".avipack/plans/**", ".avipack/checklists/**", ".avipack/reports/bots/**"]
    },
    supportsApply: true,
    allowedActions: ["inspect-architecture", "plan-architecture-review", "write-avipack-artifacts"],
    blockedActions: ["modify-source-code", "rewrite-existing-adrs", "call-external-ai", "run-autonomously"]
  },
  {
    id: "avipack.bot.builder",
    name: "AviBuilder",
    packageName: "@avipack/bot-builder",
    version: "0.1.0",
    description: "Prepares implementation plans aligned to the project brain.",
    permissions: {
      read: [".avipack/**", "docs/**", "packages/**", "src/**"],
      write: [".avipack/plans/**", ".avipack/tasks/**", ".avipack/checklists/**", ".avipack/reports/bots/**"]
    },
    supportsApply: true,
    allowedActions: ["inspect-implementation-context", "plan-implementation", "write-avipack-artifacts"],
    blockedActions: ["modify-source-code", "create-tests", "change-package-scripts", "call-external-ai"]
  },
  {
    id: "avipack.bot.guard",
    name: "AviGuard",
    packageName: "@avipack/bot-guard",
    version: "0.1.0",
    description: "Produces QA, test, review, and conflict reports.",
    permissions: {
      read: [".avipack/**", "docs/**", "packages/**", "src/**", "tests/**"],
      write: [".avipack/checklists/**", ".avipack/plans/**", ".avipack/tasks/**", ".avipack/reports/bots/**"]
    },
    supportsApply: true,
    allowedActions: ["inspect-qa-context", "plan-risk-review", "write-avipack-artifacts"],
    blockedActions: ["modify-source-code", "modify-tests", "change-ci", "call-external-ai"]
  }
];

export function listKnownBots(): BotManifest[] {
  return knownBots;
}

export function findKnownBot(botName: string): BotManifest | undefined {
  const normalizedName = botName.toLowerCase();

  return knownBots.find((bot) => {
    return (
      bot.name.toLowerCase() === normalizedName ||
      bot.packageName.toLowerCase() === normalizedName ||
      bot.id.toLowerCase() === normalizedName ||
      bot.id.toLowerCase().endsWith(`.${normalizedName}`)
    );
  });
}
