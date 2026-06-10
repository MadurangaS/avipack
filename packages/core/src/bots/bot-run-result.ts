export type BotRunMode = "report" | "dry-run" | "apply";

export interface BotRunResult {
  botId: string;
  botName: string;
  timestamp: string;
  projectName: string;
  mode: BotRunMode;
  filesInspected: string[];
  findings: string[];
  warnings: string[];
  plannedActions: string[];
  appliedActions: string[];
  filesWritten: string[];
  blockedActions: string[];
  reportPath?: string;
  safetyStatement: string;
}
