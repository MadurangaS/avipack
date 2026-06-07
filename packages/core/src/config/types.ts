export interface AvipackConfig {
  project: {
    id?: string;
    name: string;
    template?: string;
    mode?: "init" | "adopt";
  };
  brain: {
    root: string;
    path: string;
  };
  bots: {
    installed: string[];
    enabled: string[];
  };
}

export interface BrainCheckResult {
  passed: boolean;
  checkedFiles: string[];
  missingFiles: string[];
  errors: string[];
  warnings: string[];
  reportWritten?: boolean;
  reportMessage?: string;
}
