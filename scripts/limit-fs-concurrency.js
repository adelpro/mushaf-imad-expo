// Global concurrency limiter for fs.promises file operations.
//
// Metro and the Expo CLI read/write thousands of files at once (9000+ mushaf
// page images). On Windows the C runtime / libuv caps the number of
// simultaneously open files (~512-8192), so huge parallel batches (Promise.all
// over all assets) abort bundling/export with EMFILE. This preload wraps the
// parallel-capable fs.promises calls in a semaphore that keeps at most
// MAX_CONCURRENT operations in flight while preserving semantics.
//
// Load with: node -r ./scripts/limit-fs-concurrency.js
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");

const MAX_CONCURRENT = 500;

function semaphore(max) {
  let active = 0;
  const waiters = [];

  function acquire() {
    if (active < max) {
      active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => waiters.push(resolve));
  }

  function release() {
    active--;
    const next = waiters.shift();
    if (next) {
      active++;
      next();
    }
  }

  return (fn) =>
    function (...args) {
      return acquire().then(() => fn(...args).finally(release));
    };
}

const limit = semaphore(MAX_CONCURRENT);

fs.promises.readFile = limit(fs.promises.readFile.bind(fs.promises));
fs.promises.writeFile = limit(fs.promises.writeFile.bind(fs.promises));
fs.promises.mkdir = limit(fs.promises.mkdir.bind(fs.promises));
// readdir can open many handles too (metro-file-map crawler).
fs.promises.readdir = limit(fs.promises.readdir.bind(fs.promises));

console.log(`[fs-limiter] fs.promises concurrency capped at ${MAX_CONCURRENT}`);
