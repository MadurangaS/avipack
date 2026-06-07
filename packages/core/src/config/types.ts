export interface AvipackConfig {
  project: {
    id: string;
    name: string;
    template: string;
  };
  brain: {
    path: string;
  };
  bots: {
    enabled: string[];
  };
}

export interface BrainCheckResult {
  status: "ok" | "missing";
  checkedPath: string;
  missingPaths: string[];
}
