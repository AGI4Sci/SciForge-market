#!/usr/bin/env node
/**
 * Public catalog gate: exact type counts, unique slugs, required curated copy,
 * and a strict blocklist for internal paths, hashes, candidate metadata and
 * download/install claims. This intentionally checks the public JSON, not the
 * internal inventory.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const path = resolve(root, "lib/catalog-public.json");

const expected = { plugin: 11, builtin: 26, skill: 4, template: 1, fixture: 3 };
const allowedStatuses = new Set(["partial", "adapting", "integrated", "documented", "development", "testing"]);
const allowedKinds = new Set(Object.keys(expected));
const forbidden = [
  "sourcePath", "sha256", "sourceCommit", "candidate", "artifactFile",
  "readiness", "distribution", "signedBy", "publisherKey", "SHA-256",
  "/Users/", "packages/", "plugins/", "internal-market", "SciForge_private",
  "BEGIN PRIVATE KEY", "github_pat_", "ghp_",
];

let data;
try {
  data = JSON.parse(await readFile(path, "utf8"));
} catch (error) {
  console.error(`check-catalog-data: cannot read ${path}: ${error.message}`);
  process.exit(1);
}

const errors = [];
const fail = (message) => errors.push(message);
if (data.format !== 1) fail("format must be 1");
if (data.kind !== "public-catalog") fail("kind must be public-catalog");
if (data.total !== 45) fail(`total must be 45, got ${data.total}`);
if (!data.counts || Object.keys(expected).some((kind) => data.counts[kind] !== expected[kind])) {
  fail(`counts mismatch: ${JSON.stringify(data.counts)}`);
}
if (!Array.isArray(data.items) || data.items.length !== 45) fail("items must contain exactly 45 entries");

const ids = new Set();
const slugs = new Set();
for (const item of data.items ?? []) {
  const label = item?.slug ?? "(missing)";
  for (const field of ["id", "slug", "kind", "title", "summary", "status", "statusLabel", "statusDetail"]) {
    if (typeof item?.[field] !== "string" || !item[field].trim()) fail(`${label}: missing ${field}`);
  }
  if (!allowedKinds.has(item.kind)) fail(`${label}: invalid kind ${item.kind}`);
  if (!allowedStatuses.has(item.status)) fail(`${label}: invalid status ${item.status}`);
  if (ids.has(item.id)) fail(`${label}: duplicate id`);
  if (slugs.has(item.slug)) fail(`${label}: duplicate slug`);
  ids.add(item.id);
  slugs.add(item.slug);
  if (!Array.isArray(item.categories) || item.categories.length === 0) fail(`${label}: categories required`);
  if (!Array.isArray(item.features) || item.features.length === 0) fail(`${label}: features required`);
  if (!Array.isArray(item.scenarios) || item.scenarios.length === 0) fail(`${label}: scenarios required`);
  if (!Array.isArray(item.related)) fail(`${label}: related must be an array`);
  for (const related of item.related ?? []) {
    if (typeof related.slug !== "string" || typeof related.title !== "string" || typeof related.relation !== "string") {
      fail(`${label}: malformed related item`);
    }
  }
  const serialized = JSON.stringify(item);
  for (const token of forbidden) {
    if (serialized.includes(token)) fail(`${label}: forbidden public token ${token}`);
  }
  if (/[a-f0-9]{64}/i.test(serialized)) fail(`${label}: 64-hex digest-looking value`);
}

for (const slug of [
  "text-stats", "unit-conversion", "domain-artifact-versions",
  "skill-openspec-explore", "plugin-template", "fixtures-test-fixtures",
]) {
  if (!slugs.has(slug)) fail(`required public item missing: ${slug}`);
}
if (
  (data.items ?? []).filter((item) => item.kind === "fixture").length !== 3 ||
  (data.items ?? []).filter((item) => item.kind === "template").length !== 1
) {
  fail("fixture/template group counts are wrong");
}

if (errors.length) {
  console.error("check-catalog-data: failed");
  for (const message of errors.slice(0, 30)) console.error(`  - ${message}`);
  process.exit(1);
}
console.log(`check-catalog-data: passed (${data.total} items; ${JSON.stringify(data.counts)})`);