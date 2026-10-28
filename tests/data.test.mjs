import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;

test("check-market-data 通过且数据形状正确", async () => {
  const { stdout } = await run("node", ["scripts/check-market-data.mjs"], { cwd: root });
  assert.match(stdout, /通过/);

  const payload = JSON.parse(await readFile(new URL("../lib/market-public.json", import.meta.url), "utf8"));
  assert.equal(payload.format, 1);
  assert.equal(payload.kind, "public-whitelist");
  assert.ok(payload.plugins.length >= 2);
  assert.equal(new Set(payload.plugins.map((plugin) => plugin.slug)).size, payload.plugins.length);
  assert.equal(new Set(payload.plugins.map((plugin) => plugin.name)).size, payload.plugins.length);

  for (const plugin of payload.plugins) {
    assert.match(plugin.sha256, /^[0-9a-f]{64}$/);
    assert.ok(plugin.sizeBytes > 0);
    assert.ok(plugin.version.length > 0);
    assert.ok(plugin.engineRange.length > 0);
  }
});

test("文案层按 slug 与数据一一对应，且不含技术字段", async () => {
  const payload = JSON.parse(await readFile(new URL("../lib/market-public.json", import.meta.url), "utf8"));
  const copy = await readFile(new URL("../lib/plugin-copy.ts", import.meta.url), "utf8");
  for (const plugin of payload.plugins) {
    assert.ok(copy.includes(`"${plugin.slug}":`), plugin.slug);
  }
  for (const field of ["sha256", "sizeBytes", "engineRange", "artifactFile"]) {
    assert.doesNotMatch(copy, new RegExp(`\\b${field}\\s*:`), field);
  }
});