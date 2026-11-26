import raw from "./catalog-public.json";
import english from "./catalog-public.en.json";
import { statusLabels, type Locale } from "./locale";

export type CatalogKind = "plugin" | "builtin" | "skill" | "template" | "fixture";
export type CatalogStatus = "partial" | "verified" | "adapting" | "integrated" | "documented" | "development" | "testing";

export type CatalogRelated = Readonly<{
  slug: string;
  title: string;
  relation: string;
}>;

export type CatalogItem = Readonly<{
  id: string;
  slug: string;
  kind: CatalogKind;
  title: string;
  searchAlias?: string;
  summary: string;
  categories: readonly string[];
  features: readonly string[];
  scenarios: readonly string[];
  status: CatalogStatus;
  statusLabel: string;
  statusDetail: string;
  related: readonly CatalogRelated[];
}>;

export type CatalogCounts = Readonly<Record<CatalogKind, number>>;

export const catalogSnapshot = {
  generatedAt: raw.generatedAt,
  counts: raw.counts as CatalogCounts,
  total: raw.total,
  kindLabels: raw.kindLabels as Readonly<Record<CatalogKind, string>>,
} as const;

export const categoryLabels: Readonly<Record<string, string>> = {
  text: "文本",
  utility: "实用工具",
  science: "科学计算",
  "life-science": "生命科学",
  workspace: "工作区",
  inspection: "检查",
  research: "研究",
  evidence: "证据",
  git: "Git",
  checkpoints: "检查点",
  preview: "预览",
  project: "项目",
  plotting: "绘图",
  rendering: "渲染",
  visual: "视觉",
  review: "审阅",
  collaboration: "协作",
  artifacts: "科研制品",
  browser: "浏览器",
  automation: "自动化",
  "computer-use": "计算机操作",
  content: "内容",
  data: "数据",
  dataset: "数据集",
  identity: "身份",
  local: "本地",
  integration: "集成",
  papers: "论文",
  remote: "远程",
  infrastructure: "基础设施",
  presentation: "展示",
  compute: "计算",
  terminal: "终端",
  interaction: "交互",
  workflow: "工作流",
  development: "开发资源",
  testing: "测试资源",
};

const englishCopy: Record<string, Pick<CatalogItem, "title" | "summary" | "features" | "scenarios" | "statusDetail">> = english;

export const catalogItems: readonly CatalogItem[] = raw.items.map((rawItem) => {
  const item = rawItem as CatalogItem;
  const title = englishCopy[item.slug]?.title;
  if ((item.kind === "plugin" || item.kind === "builtin") && title && title !== item.title) {
    return { ...item, title, searchAlias: item.title };
  }
  return item;
});

const englishItems = catalogItems.map((item): CatalogItem => ({
  ...item,
  ...englishCopy[item.slug],
  statusLabel: statusLabels.en[item.status],
  related: item.related.map((related) => ({
    ...related,
    title: englishCopy[related.slug]?.title ?? related.title,
    relation: "Related resource",
  })),
}));

export function catalogItemsFor(locale: Locale): readonly CatalogItem[] {
  return locale === "en" ? englishItems : catalogItems;
}

export function getCatalogItem(slug: string, locale: Locale = "zh"): CatalogItem | undefined {
  return catalogItemsFor(locale).find((item) => item.slug === slug);
}

export function catalogPath(item: Pick<CatalogItem, "slug">): string {
  return `/catalog/${item.slug}`;
}

export const statusTone: Readonly<Record<CatalogStatus, "ok" | "progress" | "muted" | "dev">> = {
  partial: "progress",
  verified: "ok",
  adapting: "progress",
  integrated: "ok",
  documented: "muted",
  development: "dev",
  testing: "dev",
};


export function categoryLabel(value: string, locale: Locale): string {
  if (locale === "zh") return categoryLabels[value] ?? value;
  if (value === "git") return "Git";
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("-", " ");
}
