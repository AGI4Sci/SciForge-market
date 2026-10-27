#!/usr/bin/env node
/**
 * 导出版物白名单数据（单一来源，不手工维护第二套版本/权限/哈希）。
 *
 * 输入来自现有生成流程的产物：
 *   --index     <path>  market/index.json（scripts/dsh-plugin-market-index.mjs 生成）
 *   --plugins   <dir>   插件源码目录（读取 package.json 的 engines.dsh 兼容范围）
 *   --artifacts <dir>   制品目录（可选；读取 META-INF/sciforge-signature.json 的
 *                       algorithm 与 publisherId。不含签名本体，不含任何密钥）
 *   --commit    <sha>   生成索引所对应的私有仓 commit（溯源）
 *   --out       <path>  输出文件（提交进本仓，构建时读取）
 *
 * 规则：
 * - 只搬运“已发表字段”，字段缺失/形状不符立即失败，不猜、不补。
 * - 不导出 blocked 清单、不导出 source 内部路径、不导出 entry/runtimeNote。
 * - 输出为构建时快照；站点运行期不访问任何后端。
 */
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith("--") || value === undefined) {
      fail(`参数不完整: ${key ?? "(空)"}`);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function fail(message) {
  console.error(`export-market-data: ${message}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
for (const required of ["index", "plugins", "commit", "out"]) {
  if (!args[required]) fail(`缺少 --${required}`);
}

const index = JSON.parse(await readFile(resolve(args.index), "utf8"));
if (index.format !== 1) fail(`索引 format 不是 1: ${index.format}`);
if (!Array.isArray(index.plugins) || index.plugins.length === 0) fail("索引没有 plugins 数组");
if (typeof index.generatedAt !== "string" || typeof index.dshRuntimeVersion !== "string") {
  fail("索引缺少 generatedAt / dshRuntimeVersion");
}

const effects = new Set(["read", "compute", "workspace-write", "external-write", "destructive"]);
const sha256Pattern = /^[0-9a-f]{64}$/;
const pluginsDir = resolve(args.plugins);
const artifactsDir = args.artifacts ? resolve(args.artifacts) : null;

const plugins = [];
for (const plugin of index.plugins) {
  for (const field of ["name", "title", "version", "publisher", "categories", "tools", "hostDependencies", "artifact"]) {
    if (plugin[field] === undefined) fail(`${plugin.name ?? "(未知插件)"} 缺少字段 ${field}`);
  }
  const slug = String(plugin.source ?? "")
    .split("/")
    .filter(Boolean)
    .pop();
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(`source 无法解析为 slug: ${plugin.source}`);

  const pkg = JSON.parse(await readFile(join(pluginsDir, slug, "package.json"), "utf8"));
  const engineRange = typeof pkg?.engines?.dsh === "string" ? pkg.engines.dsh.trim() : "";
  if (!engineRange) fail(`${slug} 的 package.json 缺少 engines.dsh`);

  if (!Number.isInteger(plugin.artifact?.sizeBytes) || plugin.artifact.sizeBytes <= 0) {
    fail(`${slug} 的 artifact.sizeBytes 不是正整数`);
  }
  if (!sha256Pattern.test(String(plugin.artifact?.sha256 ?? ""))) fail(`${slug} 的 artifact.sha256 形状不对`);
  if (typeof plugin.artifact?.file !== "string" || plugin.artifact.file.length === 0) fail(`${slug} 缺少 artifact.file`);

  const tools = Array.isArray(plugin.tools)
    ? plugin.tools.map((tool) => {
        if (typeof tool?.name !== "string" || typeof tool?.id !== "string" || !effects.has(tool?.effect)) {
          fail(`${slug} 的 tools 形状不对`);
        }
        return { name: tool.name, id: tool.id, effect: tool.effect };
      })
    : fail(`${slug} 的 tools 不是数组`);

  let signature = null;
  if (artifactsDir) {
    try {
      const raw = execFileSync("unzip", ["-p", join(artifactsDir, plugin.artifact.file), "META-INF/sciforge-signature.json"], {
        encoding: "utf8",
      });
      const parsed = JSON.parse(raw);
      if (typeof parsed?.algorithm === "string" && typeof parsed?.publisherId === "string") {
        signature = { algorithm: parsed.algorithm, publisherId: parsed.publisherId };
      }
    } catch (error) {
      fail(`${slug} 读取签名元数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  plugins.push({
    slug,
    name: plugin.name,
    title: plugin.title,
    version: plugin.version,
    publisher: plugin.publisher,
    categories: plugin.categories,
    tools,
    hostDependencies: plugin.hostDependencies,
    sizeBytes: plugin.artifact.sizeBytes,
    sha256: plugin.artifact.sha256,
    engineRange,
    signature,
  });
}

const output = {
  format: 1,
  kind: "public-whitelist",
  sourceFile: "market/index.json",
  sourceCommit: args.commit,
  generatedAt: index.generatedAt,
  dshRuntimeVersion: index.dshRuntimeVersion,
  exportedAt: new Date().toISOString(),
  plugins,
};

await writeFile(resolve(args.out), `${JSON.stringify(output, null, 2)}\n`);
console.log(`export-market-data: 导出 ${plugins.length} 个插件 -> ${resolve(args.out)}`);