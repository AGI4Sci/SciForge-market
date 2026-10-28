#!/usr/bin/env node
/**
 * 构建前数据校验（单一来源约束）。
 *
 * 校验对象：
 *   lib/market-public.json  —— 由现有生成流程导出的公开白名单（唯一技术数据来源）
 *   lib/plugin-copy.ts      —— 编辑文案层（按 slug 关联，不得包含技术字段）
 *
 * 规则：
 * - 技术字段（ID/版本/权限/兼容/哈希）只允许来自白名单；文案层出现即失败。
 * - 缺失字段、重复 ID/slug、错误哈希、空标题、非法工具声明一律失败。
 * - 未知分类给出告警，页面按原值回退展示（受控回退，不阻断构建）。
 * - 发现本机路径、内部诊断字样、凭据模式时失败。
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = resolve(root, "lib/market-public.json");
const COPY_PATH = resolve(root, "lib/plugin-copy.ts");

const effects = new Set(["read", "compute", "workspace-write", "external-write", "destructive"]);
const knownCategories = new Set(["text", "utility", "science"]);
const slugPattern = /^[a-z0-9][a-z0-9-]*$/;
const sha256Pattern = /^[0-9a-f]{64}$/;
const semverPattern = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

let data;
try {
  data = JSON.parse(await readFile(DATA_PATH, "utf8"));
} catch (error) {
  console.error(`check-market-data: 无法读取 ${DATA_PATH}: ${error.message}`);
  process.exit(1);
}

if (data.format !== 1) fail("白名单 format 必须为 1");
if (data.sourceCommit !== undefined) fail("sourceCommit must not be exported");
if (Number.isNaN(Date.parse(String(data.generatedAt ?? "")))) fail("generatedAt must be a parseable time");
if (typeof data.dshRuntimeVersion !== "string" || data.dshRuntimeVersion.trim() === "") {
  fail("dshRuntimeVersion 不能为空");
}
if (!Array.isArray(data.plugins) || data.plugins.length === 0) fail("plugins 不能为空");

const names = new Set();
const slugs = new Set();

for (const plugin of data.plugins ?? []) {
  const label = plugin?.slug || plugin?.name || "(未知插件)";
  for (const field of ["slug", "name", "title", "version", "publisher", "engineRange"]) {
    if (typeof plugin?.[field] !== "string" || plugin[field].trim() === "") fail(`${label}: 缺少 ${field}`);
  }
  if (!slugPattern.test(String(plugin.slug ?? ""))) fail(`${label}: slug 形状不合法`);
  if (!semverPattern.test(String(plugin.version ?? ""))) fail(`${label}: version 不是 semver`);
  if (names.has(plugin.name)) fail(`${plugin.name}: 插件 ID 重复`);
  if (slugs.has(plugin.slug)) fail(`${plugin.slug}: slug 重复`);
  names.add(plugin.name);
  slugs.add(plugin.slug);

  if (!sha256Pattern.test(String(plugin.sha256 ?? ""))) fail(`${label}: sha256 形状不对`);
  if (!Number.isInteger(plugin.sizeBytes) || plugin.sizeBytes <= 0) fail(`${label}: sizeBytes 必须为正整数`);

  if (!Array.isArray(plugin.tools) || plugin.tools.length === 0) fail(`${label}: tools 不能为空`);
  const toolIds = new Set();
  for (const tool of plugin.tools ?? []) {
    if (typeof tool?.name !== "string" || tool.name.trim() === "") fail(`${label}: 工具有空名称`);
    if (typeof tool?.id !== "string" || tool.id.trim() === "") fail(`${label}: 工具有空能力 id`);
    if (toolIds.has(tool.id)) fail(`${label}: 能力 id 重复 ${tool.id}`);
    toolIds.add(tool.id);
    if (!effects.has(tool?.effect)) fail(`${label}: 非法 effect ${tool?.effect}`);
  }

  if (!Array.isArray(plugin.hostDependencies)) fail(`${label}: hostDependencies 必须是数组`);
  if (plugin.signature !== null && plugin.signature !== undefined) {
    if (plugin.signature.algorithm !== "ed25519") fail(`${label}: 签名算法必须是 ed25519`);
    if (typeof plugin.signature.publisherId !== "string" || plugin.signature.publisherId === "") {
      fail(`${label}: 签名缺少 publisherId`);
    }
  }

  for (const category of plugin.categories ?? []) {
    if (!knownCategories.has(category)) warn(`${label}: 未知分类 "${category}"（页面按原值回退展示）`);
  }
}

let copyText;
try {
  copyText = await readFile(COPY_PATH, "utf8");
} catch (error) {
  console.error(`check-market-data: 无法读取 ${COPY_PATH}: ${error.message}`);
  process.exit(1);
}

for (const slug of slugs) {
  if (!copyText.includes(`"${slug}":`)) fail(`文案层缺少插件 "${slug}" 的说明，避免空详情`);
}
for (const match of copyText.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\{/gm)) {
  if (!slugs.has(match[1])) fail(`文案层出现数据中不存在的插件 "${match[1]}"`);
}

for (const forbidden of ["sha256", "sizeBytes", "engineRange", "artifactFile", "hostDependencies"]) {
  if (new RegExp(`\\b${forbidden}\\s*:`).test(copyText)) {
    fail(`文案层不得维护技术字段：${forbidden}（应来自白名单导出）`);
  }
}

const serialized = JSON.stringify(data);
for (const [pattern, message] of [
  [/\/Users\//, "数据中出现本机绝对路径"],
  [/SCIFORGE_[A-Z_]+/, "数据中出现环境变量名"],
  [/runtimeGap|"blocked"/, "数据中出现未上架诊断字段"],
  [/PRIVATE KEY|ghp_|github_pat_/, "数据中出现凭据模式"],
]) {
  if (pattern.test(serialized)) fail(message);
}

for (const message of warnings) console.warn(`check-market-data: 警告 — ${message}`);

if (errors.length > 0) {
  console.error("check-market-data: 校验失败");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(`check-market-data: 通过（${data.plugins.length} 个插件，${warnings.length} 条告警）`);