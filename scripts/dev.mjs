// Dev launcher: force NODE_ENV=development so PostCSS/Tailwind run correctly,
// regardless of any ambient NODE_ENV (e.g. "production") inherited from the shell.
// Spawns `next dev` with the correct environment.
import { spawn } from "node:child_process";

process.env.NODE_ENV = "development";

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "development" },
});

child.on("exit", (code) => process.exit(code ?? 0));
