export const manifest = {
  id: "avipack.bot.architect",
  name: "AviArchitect",
  packageName: "@avipack/bot-architect",
  version: "0.1.0",
  description: "Reviews architecture, ADRs, module boundaries, and impact analysis.",
  permissions: {
    read: [".avipack/**", "docs/**", "packages/**", "src/**"],
    write: [".avipack/decisions/**", ".avipack/reports/**"]
  }
} as const;
