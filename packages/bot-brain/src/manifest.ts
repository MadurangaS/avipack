export const manifest = {
  id: "avipack.bot.brain",
  name: "AviBrain",
  packageName: "@avipack/bot-brain",
  version: "0.1.0",
  description: "Maintains project requirements, scope, glossary, and project memory.",
  permissions: {
    read: [".avipack/**", "docs/**"],
    write: [".avipack/brain/**", ".avipack/changes/**"]
  }
} as const;
