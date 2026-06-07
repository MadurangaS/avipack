export { manifest } from "./manifest.js";

export function run(): string {
  return [
    "AviArchitect",
    "",
    "Status: foundation mode",
    "Result: architecture review is scaffolded; no files were modified.",
    "Next: ADR and impact analysis workflows will be implemented in Phase 2."
  ].join("\n");
}
