#!/usr/bin/env node
/**
 * Assert that the Pages export uses the configured base path for local assets
 * and links. This catches a stale build cache that silently drops basePath.
 */
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const expected = (process.env.SITE_BASE_PATH?.trim() || "/SciForge-market").replace(/\/$/, "");

const html = await readFile(resolve(root, "dist/client/index.html"), "utf8");
const localUrls = [...html.matchAll(/(?:src|href)="(\/[^"]*)"/g)].map((match) => match[1]);
const bad = localUrls.filter((url) => url !== "/" && !url.startsWith(`${expected}/`));

if (!expected.startsWith("/")) {
  console.error(`check-pages-output: base path must start with /: ${expected}`);
  process.exit(1);
}
if (!localUrls.some((url) => url.startsWith(`${expected}/assets/`))) {
  console.error(`check-pages-output: no assets under ${expected}/assets/`);
  process.exit(1);
}
if (bad.length > 0) {
  console.error("check-pages-output: root-relative URLs escaped the base path");
  for (const url of bad.slice(0, 10)) console.error(`  - ${url}`);
  process.exit(1);
}
for (const path of ["dist/client/404.html", "dist/client/plugins/text-stats/index.html", "dist/client/plugins/unit-conversion/index.html"]) {
  const info = await stat(resolve(root, path));
  if (!info.isFile()) {
    console.error(`check-pages-output: missing ${path}`);
    process.exit(1);
  }
}
console.log(`check-pages-output: 通过（base ${expected}，${localUrls.length} 个本地链接/资源）`);