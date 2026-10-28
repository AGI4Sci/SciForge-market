import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const payloadUrl = new URL("../lib/catalog-public.json", import.meta.url);

test("public catalog exposes exactly the five resource groups", async () => {
  const data = JSON.parse(await readFile(payloadUrl, "utf8"));
  assert.equal(data.format, 1);
  assert.equal(data.kind, "public-catalog");
  assert.equal(data.total, 45);
  assert.deepEqual(data.counts, { plugin: 11, builtin: 26, skill: 4, template: 1, fixture: 3 });
  assert.equal(data.items.length, 45);
  assert.equal(new Set(data.items.map((item) => item.slug)).size, 45);
  assert.equal(new Set(data.items.map((item) => item.id)).size, 45);
});

test("every public item has curated copy and no internal fields", async () => {
  const data = JSON.parse(await readFile(payloadUrl, "utf8"));
  for (const item of data.items) {
    for (const field of ["title", "summary", "statusLabel", "statusDetail"]) {
      assert.equal(typeof item[field], "string", `${item.slug}:${field}`);
      assert.ok(item[field].trim().length > 0, `${item.slug}:${field}`);
    }
    assert.ok(item.features.length > 0, `${item.slug}:features`);
    assert.ok(item.scenarios.length > 0, `${item.slug}:scenarios`);
    const serialized = JSON.stringify(item);
    for (const forbidden of ["sourcePath", "sha256", "sourceCommit", "candidate", "/Users/", "plugins/", "packages/"]) {
      assert.equal(serialized.includes(forbidden), false, `${item.slug}:${forbidden}`);
    }
    assert.doesNotMatch(serialized, /[a-f0-9]{64}/i, `${item.slug}:digest`);
  }
});

test("fixtures and template are explicitly development/testing resources", async () => {
  const data = JSON.parse(await readFile(payloadUrl, "utf8"));
  const fixtures = data.items.filter((item) => item.kind === "fixture");
  const template = data.items.find((item) => item.kind === "template");
  assert.equal(fixtures.length, 3);
  assert.ok(fixtures.every((item) => item.status === "testing"));
  assert.equal(template?.status, "development");
  assert.match(template?.statusDetail ?? "", /不是.*安装|不是现成|开发/);
});