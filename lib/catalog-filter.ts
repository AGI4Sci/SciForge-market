/**
 * Pure filtering and URL state for the full public catalog.
 * Kept independent of JSON/React so node --test can exercise it directly.
 */
export type CatalogFilterState = Readonly<{
  query: string;
  kind: string;
  category: string;
  status: string;
}>;

export type CatalogFilterItem = Readonly<{
  title: string;
  summary: string;
  kind: string;
  categories: readonly string[];
  features: readonly string[];
  scenarios: readonly string[];
  status: string;
}>;

export const EMPTY_FILTER: CatalogFilterState = { query: "", kind: "all", category: "all", status: "all" };
const MAX_QUERY_LENGTH = 120;

export function normalizeQuery(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

export function uniqueValues(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

export function parseCatalogFilter(search: string, allowed: Readonly<{
  kinds: readonly string[];
  categories: readonly string[];
  statuses: readonly string[];
}>): CatalogFilterState {
  const params = new URLSearchParams(search);
  const kind = params.get("type") ?? "all";
  const category = params.get("category") ?? "all";
  const status = params.get("status") ?? "all";
  return {
    query: normalizeQuery(params.get("q") ?? ""),
    kind: kind === "all" || allowed.kinds.includes(kind) ? kind : "all",
    category: category === "all" || allowed.categories.includes(category) ? category : "all",
    status: status === "all" || allowed.statuses.includes(status) ? status : "all",
  };
}

export function buildCatalogQuery(state: CatalogFilterState): string {
  const params = new URLSearchParams();
  const query = normalizeQuery(state.query);
  if (query) params.set("q", query);
  if (state.kind !== "all") params.set("type", state.kind);
  if (state.category !== "all") params.set("category", state.category);
  if (state.status !== "all") params.set("status", state.status);
  return params.toString();
}

export function filterCatalog<T extends CatalogFilterItem>(items: readonly T[], state: CatalogFilterState): T[] {
  const query = normalizeQuery(state.query).toLowerCase();
  return items.filter((item) => {
    if (state.kind !== "all" && item.kind !== state.kind) return false;
    if (state.category !== "all" && !item.categories.includes(state.category)) return false;
    if (state.status !== "all" && item.status !== state.status) return false;
    if (!query) return true;
    const haystack = [
      item.title,
      item.summary,
      item.kind,
      ...item.categories,
      ...item.features,
      ...item.scenarios,
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}