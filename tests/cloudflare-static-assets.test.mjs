import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));

test("Cloudflare staging deploys the real frontend as Worker Static Assets", () => {
  assert.equal(config.name, "looply-v3-staging");
  assert.equal(config.main, "./backend/cloudflare/worker.mjs");
  assert.equal(config.assets.directory, "./dist");
  assert.equal(config.assets.binding, "ASSETS");
  assert.deepEqual(config.assets.run_worker_first, ["/health", "/neon-health", "/api/*"]);
  assert.equal(config.workers_dev, true);
  assert.equal(config.preview_urls, false);
});

test("Static frontend keeps API and health traffic on the Worker", () => {
  const routes = config.assets.run_worker_first;
  assert.ok(routes.includes("/api/*"));
  assert.ok(routes.includes("/health"));
  assert.ok(routes.includes("/neon-health"));
  assert.ok(!routes.includes("/*"), "ordinary HTML and assets must use the static asset service");
});
