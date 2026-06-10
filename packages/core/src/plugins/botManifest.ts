export interface BotPermissions {
  read: string[];
  write: string[];
}

export interface BotManifest {
  id: string;
  name: string;
  packageName: string;
  version: string;
  description: string;
  permissions: BotPermissions;
  supportsApply?: boolean;
  allowedActions?: string[];
  blockedActions?: string[];
}
