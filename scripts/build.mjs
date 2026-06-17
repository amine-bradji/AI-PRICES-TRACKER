// Build launcher: force NODE_ENV=production for a correct optimized build,
// overriding any ambient env. Spawns `next build`.
import { spawn } from "node:child_process";

process.env.NODE_ENV = "production";

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "production" },
});

child.on("exit", (code) => process.exit(code ?? 0));
