"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categoryLabels,
  catalogSnapshot,
  type CatalogCounts,
  type CatalogItem,
} from "@/lib/catalog-data";
import {
  EMPTY_FILTER,
  buildCatalogQuery,
  filterCatalog,
  parseCatalogFilter,
  uniqueValues,
  type CatalogFilterState,
} from "@/lib/catalog-filter";

const INITIAL_STATE: CatalogFilterState = EMPTY_FILTER;

function labelForCategory(value: string): string {
  return categoryLabels[value] ?? value;
}

export function CatalogDirectory({ items }: { items: readonly CatalogItem[] }) {
  const allowed = useMemo(() => ({
    kinds: uniqueValues(items.map((item) => item.kind)),
    categories: uniqueValues(items.flatMap((item) => item.categories)).sort(),
    statuses: uniqueValues(items.map((item) => item.status)),
  }), [items]);
  const [state, setState] = useState<CatalogFilterState>(INITIAL_STATE);

  useEffect(() => {
    const apply = () => setState(parseCatalogFilter(window.location.search, allowed));
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [allowed]);

  const commit = (next: CatalogFilterState, mode: "push" | "replace") => {
    setState(next);
    const query = buildCatalogQuery(next);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const visible = useMemo(() => filterCatalog(items, state), [items, state]);
  const kindCounts = catalogSnapshot.counts as CatalogCounts;
  const activeLabel = state.kind === "all"
    ? "全部资源"
    : (catalogSnapshot.kindLabels[state.kind as keyof CatalogCounts] ?? state.kind);
  const statusLabel = state.status === "all"
    ? null
    : (items.find((item) => item.status === state.status)?.statusLabel ?? state.status);

  return (
    <div className="market-catalog">
      <div className="catalog-summary" aria-label="资源分类计数">
        <strong>全部资源 · {catalogSnapshot.total}</strong>
        <span>插件 {kindCounts.plugin}</span>
        <span>内置模块 {kindCounts.builtin}</span>
        <span>技能 {kindCounts.skill}</span>
        <span>模板 {kindCounts.template}</span>
        <span>测试夹具 {kindCounts.fixture}</span>
      </div>

      <div className="market-search">
        <label className="visually-hidden" htmlFor="market-search-input">
          搜索名称、用途、能力或场景
        </label>
        <input
          id="market-search-input"
          type="search"
          value={state.query}
          onChange={(event) => commit({ ...state, query: event.target.value }, "replace")}
          placeholder="搜索名称、用途、能力或场景…"
        />
        {state.query ? (
          <button
            type="button"
            className="market-search-clear"
            onClick={() => commit({ ...state, query: "" }, "replace")}
          >
            清除
          </button>
        ) : null}
      </div>

      <div className="market-chips" role="group" aria-label="按资源类型筛选">
        <button
          type="button"
          className={`market-chip${state.kind === "all" ? " is-active" : ""}`}
          aria-pressed={state.kind === "all"}
          onClick={() => commit({ ...state, kind: "all" }, "push")}
        >
          全部
        </button>
        {allowed.kinds.map((kind) => (
          <button
            key={kind}
            type="button"
            className={`market-chip${state.kind === kind ? " is-active" : ""}`}
            aria-pressed={state.kind === kind}
            onClick={() => commit({ ...state, kind }, "push")}
          >
            {catalogSnapshot.kindLabels[kind as keyof CatalogCounts] ?? kind} {kindCounts[kind as keyof CatalogCounts]}
          </button>
        ))}
      </div>

      <div className="catalog-selects">
        <label>
          <span>业务分类</span>
          <select
            value={state.category}
            onChange={(event) => commit({ ...state, category: event.target.value }, "push")}
          >
            <option value="all">全部分类</option>
            {allowed.categories.map((category) => (
              <option key={category} value={category}>{labelForCategory(category)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>状态</span>
          <select
            value={state.status}
            onChange={(event) => commit({ ...state, status: event.target.value }, "push")}
          >
            <option value="all">全部状态</option>
            {allowed.statuses.map((status) => (
              <option key={status} value={status}>
                {items.find((item) => item.status === status)?.statusLabel ?? status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="market-count" aria-live="polite">
        {`${activeLabel}${statusLabel ? ` · ${statusLabel}` : ""} · ${visible.length}`}
      </p>

      {visible.length === 0 ? (
        <div className="market-empty">
          <p>没有匹配的资源。</p>
          <button
            type="button"
            className="market-action market-action-quiet"
            onClick={() => commit(EMPTY_FILTER, "push")}
          >
            重置筛选
          </button>
        </div>
      ) : (
        <ul className="market-grid">
          {visible.map((item) => {
            const development = item.kind === "skill" || item.kind === "template" || item.kind === "fixture";
            return (
              <li
                className={`market-card${development ? " market-card-development" : ""}`}
                key={item.slug}
                data-kind={item.kind}
              >
                <div className="market-card-top">
                  <span className={`catalog-kind kind-${item.kind}`}>
                    {catalogSnapshot.kindLabels[item.kind]}
                  </span>
                  <span className={`catalog-status status-${item.status}`}>{item.statusLabel}</span>
                </div>
                <h2>
                  <Link href={`/catalog/${item.slug}`}>{item.title}</Link>
                </h2>
                <p className="market-summary">{item.summary}</p>
                <div className="market-card-meta">
                  <ul className="market-tags" aria-label="分类">
                    {item.categories.slice(0, 3).map((category) => (
                      <li key={category}>{labelForCategory(category)}</li>
                    ))}
                  </ul>
                  <span className="market-publisher">
                    {development ? "开发资源" : item.kind === "builtin" ? "随软件集成" : "目录条目"}
                  </span>
                </div>
                <Link className="market-card-link" href={`/catalog/${item.slug}`}>
                  查看详情 <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}