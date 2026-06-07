export const manifest = {
  id: "avipack.bot.builder",
  name: "AviBuilder",
  packageName: "@avipack/bot-builder",
  version: "0.1.0",
  description: "Prepares implementation plans aligned to the project brain.",
  permissions: {
    read: [".avipack/**", "docs/**", "packages/**", "src/**"],
    write: [".avipack/reports/**"]
  }
} as const;
