// Wrapper around `expo export` that preloads the fs concurrency limiter.
//
// The project contains 9000+ Quran page images that Metro and the Expo CLI
// read/write with unbounded Promise.all batches. On Windows this exceeds the
// C-runtime/libuv open-file limit and aborts with EMFILE. Running the export
// through this script caps file-op concurrency so the build completes.
//
// Usage: node scripts/export-app.js [extra expo export args...]

const { spawnSync } = require("child_process");
const path = require("path");

const limiter = path.join(__dirname, "limit-fs-concurrency.js");
const cli = path.join(__dirname, "..", "node_modules", "@expo", "cli", "build", "bin", "cli");

const args = process.argv.slice(2);
const expoArgs = ["export", ...args];
// Limit bundling workers by default (EMFILE), but never override a
// --max-workers flag the caller already passed.
if (!args.some((a) => a.startsWith("--max-workers"))) {
  expoArgs.push("--max-workers", "1");
}

console.log(`[export-app] running: node ${path.relative(process.cwd(), cli)} ${expoArgs.join(" ")}`);

const result = spawnSync(process.execPath, [cli, ...expoArgs], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    NODE_OPTIONS: `-r "${limiter}"${process.env.NODE_OPTIONS ? " " + process.env.NODE_OPTIONS : ""}`,
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
