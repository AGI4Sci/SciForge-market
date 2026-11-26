"use client";

import { sitePath } from "@/lib/site-path";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabels,
  catalogSnapshot,
  statusTone,
  type CatalogCounts,
  type CatalogItem,
} from "@/lib/catalog-data";
import {
  EMPTY_FILTER,
  buildCatalogQuery,
  normalizeQuery,
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
  const searchInput = useRef<HTMLInputElement>(null);
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
  const activeLabel = state.kind === "all" ? null : catalogSnapshot.kindLabels[state.kind as keyof CatalogCounts];
  const statusLabel = state.status === "all"
    ? null
    : (items.find((item) => item.status === state.status)?.statusLabel ?? state.status);

  const resultContext = [activeLabel, statusLabel].filter(Boolean).join(" · ");
  const reset = () => {
    commit(EMPTY_FILTER, "push");
    searchInput.current?.focus();
  };
  const filtered = state.kind !== "all" || state.category !== "all" || state.status !== "all" || !!normalizeQuery(state.query);

  return (
    <div className="market-catalog">
      <section className="catalog-controls" aria-label="目录筛选">
        <div className="market-search">
          <label className="visually-hidden" htmlFor="market-search-input">
            搜索名称、用途、能力或场景
          </label>
          <span className="search-icon" aria-hidden="true" />
          <input
            id="market-search-input"
            ref={searchInput}
            type="search"
            maxLength={120}
            value={state.query}
            onChange={(event) => commit({ ...state, query: event.target.value }, "replace")}
            placeholder="搜索名称、用途、能力或场景…"
          />
          {state.query ? (
            <button type="button" className="market-search-clear" onClick={() => {
              commit({ ...state, query: "" }, "replace");
              searchInput.current?.focus();
            }}>
              清除
            </button>
          ) : null}
        </div>

        <div className="market-chips" role="group" aria-label="按资源类型筛选">
          {["all", ...allowed.kinds].map((kind) => (
            <button
              key={kind}
              type="button"
              className="market-chip"
              aria-pressed={state.kind === kind}
              onClick={() => commit({ ...state, kind }, "push")}
            >
              {kind === "all" ? "全部资源" : catalogSnapshot.kindLabels[kind as keyof CatalogCounts]}{" "}
              <span>{kind === "all" ? catalogSnapshot.total : kindCounts[kind as keyof CatalogCounts]}</span>
            </button>
          ))}
        </div>

        <div className="catalog-selects">
          <div className="catalog-select">
            <label htmlFor="catalog-category">业务分类</label>
            <select
              id="catalog-category"
              value={state.category}
              onChange={(event) => commit({ ...state, category: event.target.value }, "push")}
            >
              <option value="all">全部分类</option>
              {allowed.categories.map((category) => (
                <option key={category} value={category}>{labelForCategory(category)}</option>
              ))}
            </select>
          </div>
          <div className="catalog-select">
            <label htmlFor="catalog-status">状态</label>
            <select
              id="catalog-status"
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
          </div>
        </div>
      </section>

      <div className="catalog-results">
        <p className="market-count" aria-live="polite">
          <strong>{visible.length} 项结果</strong>
          {resultContext ? <span>{resultContext}</span> : null}
        </p>
        {filtered && visible.length > 0 ? (
          <button type="button" className="catalog-reset" onClick={reset}>
            重置筛选
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="market-empty">
          <h2>没有匹配的资源</h2>
          <p>试试更短的关键词，或清除筛选重新浏览。</p>
          <button type="button" className="market-action" onClick={reset}>
            重置筛选
          </button>
        </div>
      ) : (
        <ul className="market-grid">
          {visible.map((item) => (
            <li className="market-card" key={item.slug} data-kind={item.kind}>
              <div className="market-card-top">
                <span className={`catalog-kind kind-${item.kind}`}>{catalogSnapshot.kindLabels[item.kind]}</span>
                <span className={`catalog-status status-${statusTone[item.status]}`}>{item.statusLabel}</span>
              </div>
              <h2><a href={sitePath(`/catalog/${item.slug}`)}>{item.title}</a></h2>
              <p className="market-summary">{item.summary}</p>
              <div className="market-card-meta">
                <ul className="market-tags" aria-label="分类">
                  {item.categories.slice(0, 3).map((category) => (
                    <li key={category}>{labelForCategory(category)}</li>
                  ))}
                </ul>
                <span className="market-card-arrow" aria-hidden="true">→</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
