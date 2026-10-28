/**
 * 目录浏览的纯逻辑：搜索、分类、URL 状态。
 *
 * 设计约束：
 * - 与数据层解耦（不 import JSON），便于在 node --test 里直接验证；
 * - 未知分类安全回退到 "all"；query 去首尾空白、压缩连续空白、限制长度；
 * - URL 参数只在非默认值时出现，保证链接可分享。
 */

export type CatalogState = Readonly<{ query: string; category: string }>;

export type CatalogCardLike = Readonly<{
  slug: string;
  name: string;
  title: string;
  listSummary: string;
  publisher: string;
  categories: readonly string[];
}>;

const MAX_QUERY_LENGTH = 120;

export function normalizeQuery(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

export function categoriesOf(cards: readonly CatalogCardLike[]): string[] {
  const seen = new Set<string>();
  for (const card of cards) {
    for (const category of card.categories) seen.add(category);
  }
  return Array.from(seen);
}

export function parseCatalogState(search: string, allowed: readonly string[]): CatalogState {
  const params = new URLSearchParams(search);
  const query = normalizeQuery(params.get("q") ?? "");
  const rawCategory = (params.get("category") ?? "all").trim();
  const category = rawCategory === "all" || allowed.includes(rawCategory) ? rawCategory : "all";
  return { query, category };
}

export function buildCatalogQuery(state: CatalogState): string {
  const params = new URLSearchParams();
  const query = normalizeQuery(state.query);
  if (query) params.set("q", query);
  if (state.category !== "all") params.set("category", state.category);
  return params.toString();
}

export function filterCards<T extends CatalogCardLike>(
  cards: readonly T[],
  state: CatalogState,
  labels: Readonly<Record<string, string>>,
): T[] {
  const query = normalizeQuery(state.query).toLowerCase();
  return cards.filter((card) => {
    if (state.category !== "all" && !card.categories.includes(state.category)) return false;
    if (!query) return true;
    const haystack = [
      card.name,
      card.title,
      card.listSummary,
      card.publisher,
      ...card.categories,
      ...card.categories.map((category) => labels[category] ?? category),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}