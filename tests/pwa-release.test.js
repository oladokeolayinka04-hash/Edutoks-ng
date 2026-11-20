import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("PWA service worker caches the app shell and local static assets", async () => {
  const sw = await read("../public/sw.js");
  assert.match(sw, /edutoks-shell-v4/);
  assert.match(sw, /cache\.addAll\(SHELL\)/);
  assert.match(sw, /STATIC_ASSET/);
  assert.match(sw, /clients\.claim\(\)/);
  assert.match(sw, /skipWaiting\(\)/);
});

test("PWA service worker never caches auth, database, storage or function APIs", async () => {
  const sw = await read("../public/sw.js");
  assert.match(sw, /rest\|auth\|functions\|storage\|realtime/);
  assert.match(sw, /Never cache authentication, database, edge-function or user-specific API responses/);
});

test("PWA manifest declares standalone install experience and app icons", async () => {
  const manifest = JSON.parse(await read("../public/manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
});

test("app registers the service worker and handles install prompt", async () => {
  const source = await read("../src/main.jsx");
  assert.match(source, /navigator\.serviceWorker\.register\(["']\/sw\.js["']\)/);
  assert.match(source, /beforeinstallprompt/);
  assert.match(source, /setInstallPrompt/);
});
