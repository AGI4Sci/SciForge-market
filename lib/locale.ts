import type { CatalogKind, CatalogStatus } from "./catalog-data";

export type Locale = "zh" | "en";

export const siteCopy = {
  zh: {
    catalog: "插件与能力目录", intro: "检索 SciForge 生态的插件、内置模块与开发资源，查看各组件的能力边界与适配进度。",
    directory: "全部资源", about: "目录说明", nav: "主导航", skip: "跳到正文",
    footer: "公开能力目录 · 仅展示组件元数据与适配状态",
    controls: "目录筛选", kindFilter: "按资源类型筛选", search: "搜索名称、用途或场景",
    clear: "清除", category: "业务分类", anyCategory: "全部分类", status: "状态", anyStatus: "全部状态",
    result: (count: number) => `${count} 项结果`, reset: "重置筛选", empty: "没有匹配的资源",
    emptyHint: "试试更短的关键词，或清除筛选重新浏览。",
    back: "返回目录", purpose: "用途", testPurpose: "验证目的", features: "核心能力", examples: "适用场景",
    statusDetail: "当前状态", related: "关联资源",
    theme: "外观", system: "跟随系统", light: "浅色", dark: "深色",
  },
  en: {
    catalog: "Plugins and capabilities", intro: "Explore SciForge plugins, built-in modules and developer resources. See what each one does and where it stands.",
    directory: "Catalog", about: "About", nav: "Main navigation", skip: "Skip to content",
    footer: "Public catalog · Component metadata and integration status",
    controls: "Catalog filters", kindFilter: "Filter by resource type", search: "Search names, uses or examples",
    clear: "Clear", category: "Category", anyCategory: "All categories", status: "Status", anyStatus: "All statuses",
    result: (count: number) => `${count} ${count === 1 ? "result" : "results"}`, reset: "Reset filters", empty: "No matching resources",
    emptyHint: "Try a shorter search or reset your filters.",
    back: "Back to catalog", purpose: "Purpose", testPurpose: "What it tests", features: "What it does", examples: "When to use it",
    statusDetail: "Current status", related: "Related resources",
    theme: "Appearance", system: "System", light: "Light", dark: "Dark",
  },
} as const;

export const kindLabels = {
  zh: { plugin: "插件", builtin: "内置模块", skill: "技能", template: "模板", fixture: "测试夹具" },
  en: { plugin: "Plugin", builtin: "Built-in", skill: "Skill", template: "Template", fixture: "Test fixture" },
} satisfies Record<Locale, Record<CatalogKind, string>>;

export const statusLabels = {
  zh: { partial: "部分功能已验证", verified: "测试构建已验证", adapting: "适配中", integrated: "已集成", documented: "公开说明", development: "开发资源", testing: "测试资源" },
  en: { partial: "Partially tested", verified: "Verified in test build", adapting: "Integration in progress", integrated: "Integrated", documented: "Documented", development: "Development resource", testing: "Test resource" },
} satisfies Record<Locale, Record<CatalogStatus, string>>;
