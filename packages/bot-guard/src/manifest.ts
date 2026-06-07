export const manifest = {
  id: "avipack.bot.guard",
  name: "AviGuard",
  packageName: "@avipack/bot-guard",
  version: "0.1.0",
  description: "Produces QA, test, review, and conflict reports.",
  permissions: {
    read: [".avipack/**", "docs/**", "packages/**", "src/**", "tests/**"],
    write: [".avipack/reports/**"]
  }
} as const;
