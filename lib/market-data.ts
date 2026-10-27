/**
 * 独立站数据层：读取「生成流程导出的公开白名单」（lib/market-public.json），
 * 合并策划文案层（lib/plugin-copy.ts）。
 *
 * 版本、权限（工具/效果）、包大小、SHA-256、兼容范围、签名元数据
 * 全部来自白名单导出，站点不手工维护这些字段。
 * 缺失信息一律以“待补”呈现，不虚构。
 */
import raw from "./market-public.json";
import { pluginCopy, type PluginCopy } from "./plugin-copy";

export type MarketEffect = "read" | "compute" | "workspace-write" | "external-write" | "destructive";

export type MarketTool = Readonly<{
  name: string;
  id: string;
  effect: MarketEffect;
}>;

export type MarketExample = Readonly<{
  title: string;
  body: string;
}>;

export type MarketPlugin = Readonly<{
  slug: string;
  name: string;
  title: string;
  version: string;
  publisher: string;
  summary: string;
  categories: readonly string[];
  useCases: readonly string[];
  examples: readonly MarketExample[];
  compatibility: string;
  hostDependencies: readonly string[];
  tools: readonly MarketTool[];
  sizeBytes: number;
  sha256: string;
  signature: Readonly<{ algorithm: string; publisherId: string }> | null;
  license: string;
  notes: readonly string[];
}>;

type WhitelistPlugin = (typeof raw)["plugins"][number];

export const marketSnapshot = {
  mode: "same-generation-source" as const,
  sourceFile: raw.sourceFile,
  sourceCommit: raw.sourceCommit,
  generatedAt: raw.generatedAt,
  exportedAt: raw.exportedAt,
  dshRuntimeVersion: raw.dshRuntimeVersion
} as const;

export const categoryLabels: Readonly<Record<string, string>> = {
  text: "文本",
  utility: "实用工具",
  science: "科学计算"
};

const emptyCopy: PluginCopy = {
  listSummary: "待补（尚未提供简介）。",
  summary: "待补（尚未提供说明文案）。",
  useCases: [],
  examples: [],
  licenseNote: "待补",
  notes: ["说明文案待补。"]
};

function toPlugin(plugin: WhitelistPlugin): MarketPlugin {
  const copy = pluginCopy[plugin.slug] ?? emptyCopy;
  return {
    slug: plugin.slug,
    name: plugin.name,
    title: plugin.title,
    version: plugin.version,
    publisher: plugin.publisher,
    summary: copy.summary,
    categories: plugin.categories,
    useCases: copy.useCases,
    examples: copy.examples,
    compatibility: `插件声明 DSH ${plugin.engineRange}；索引记录的运行时版本为 ${raw.dshRuntimeVersion}。`,
    hostDependencies: plugin.hostDependencies,
    tools: plugin.tools as readonly MarketTool[],
    sizeBytes: plugin.sizeBytes,
    sha256: plugin.sha256,
    signature: plugin.signature,
    license: copy.licenseNote,
    notes: copy.notes
  };
}

export const plugins: readonly MarketPlugin[] = raw.plugins.map(toPlugin);

/**
 * 列表页所需的最小投影：只带卡片展示字段，避免把完整数据（含哈希等）
 * 发到客户端包与 hydration payload 里。
 */
export type MarketCard = Readonly<{
  slug: string;
  name: string;
  title: string;
  version: string;
  publisher: string;
  listSummary: string;
  categories: readonly string[];
  sizeBytes: number;
}>;

export const marketCards: readonly MarketCard[] = plugins.map((plugin) => ({
  slug: plugin.slug,
  name: plugin.name,
  title: plugin.title,
  version: plugin.version,
  publisher: plugin.publisher,
  listSummary: pluginCopy[plugin.slug]?.listSummary ?? emptyCopy.listSummary,
  categories: plugin.categories,
  sizeBytes: plugin.sizeBytes
}));

export function getPlugin(slug: string): MarketPlugin | undefined {
  return plugins.find((plugin) => plugin.slug === slug);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const effectLabels: Readonly<Record<MarketEffect, string>> = {
  read: "读取",
  compute: "计算",
  "workspace-write": "写入工作区",
  "external-write": "写入外部",
  destructive: "破坏性"
};