import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = ["pack"];

if (process.argv.includes("--dry-run")) {
  args.push("--dry-run");
}

const child = spawn("npm", args, {
  cwd: join(process.cwd(), "packages/cli"),
  stdio: "inherit",
  env: {
    ...process.env,
    npm_config_cache: join(tmpdir(), "avipack-npm-cache")
  }
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
