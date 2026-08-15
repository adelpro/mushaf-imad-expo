// Wrapper around `expo start` that preloads the fs concurrency limiter.
//
// Same rationale as export-app.js: the 9000+ Quran page images make Metro's
// unbounded Promise.all file batches exceed the Windows open-file limit
// (EMFILE). Running the dev server through this script caps file-op
// concurrency so bundling works on device/simulator.
//
// Usage: node scripts/start-app.js [extra expo start args...]

const { spawnSync } = require("child_process");
const path = require("path");

const limiter = path.join(__dirname, "limit-fs-concurrency.js");
const cli = path.join(__dirname, "..", "node_modules", "@expo", "cli", "build", "bin", "cli");

const args = process.argv.slice(2);
const expoArgs = ["start", ...args];

console.log(`[start-app] running: expo start ${expoArgs.slice(1).join(" ")}`);

const result = spawnSync(process.execPath, [cli, ...expoArgs], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    NODE_OPTIONS: `-r ${limiter}${process.env.NODE_OPTIONS ? " " + process.env.NODE_OPTIONS : ""}`,
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
