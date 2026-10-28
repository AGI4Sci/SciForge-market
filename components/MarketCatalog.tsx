"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryLabels, type MarketCard } from "@/lib/market-data";
import {
  buildCatalogQuery,
  categoriesOf,
  filterCards,
  parseCatalogState,
  type CatalogState,
} from "@/lib/catalog";

const icons: Readonly<Record<string, string>> = {
  "text-stats": "Aa",
  "unit-conversion": "⇄",
};

const INITIAL_STATE: CatalogState = { query: "", category: "all" };

export function MarketCatalog({ items }: { items: readonly MarketCard[] }) {
  const allowed = useMemo(() => categoriesOf(items), [items]);
  const [state, setState] = useState<CatalogState>(INITIAL_STATE);

  useEffect(() => {
    const apply = () => setState(parseCatalogState(window.location.search, allowed));
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [allowed]);

  const commit = (next: CatalogState, mode: "push" | "replace") => {
    setState(next);
    const query = buildCatalogQuery(next);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const visible = useMemo(() => filterCards(items, state, categoryLabels), [items, state]);
  const activeLabel =
    state.category === "all" ? "全部插件" : (categoryLabels[state.category] ?? state.category);

  return (
    <div className="market-catalog">
      <div className="market-search">
        <label className="visually-hidden" htmlFor="market-search-input">
          搜索插件（名称、简介、标签或插件 ID）
        </label>
        <input
          id="market-search-input"
          type="search"
          value={state.query}
          onChange={(event) => commit({ ...state, query: event.target.value }, "replace")}
          placeholder="搜索名称、简介、标签或插件 ID…"
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

      <div className="market-chips" role="group" aria-label="按分类筛选">
        <button
          type="button"
          className={`market-chip${state.category === "all" ? " is-active" : ""}`}
          aria-pressed={state.category === "all"}
          onClick={() => commit({ ...state, category: "all" }, "push")}
        >
          全部
        </button>
        {allowed.map((item) => (
          <button
            key={item}
            type="button"
            className={`market-chip${state.category === item ? " is-active" : ""}`}
            aria-pressed={state.category === item}
            onClick={() => commit({ ...state, category: item }, "push")}
          >
            {categoryLabels[item] ?? item}
          </button>
        ))}
      </div>

      <p className="market-count" aria-live="polite">
        {`${activeLabel} · ${visible.length}`}
      </p>

      {visible.length === 0 ? (
        <div className="market-empty">
          <p>没有匹配的插件。</p>
          <button
            type="button"
            className="market-action market-action-quiet"
            onClick={() => commit({ query: "", category: "all" }, "push")}
          >
            重置筛选
          </button>
        </div>
      ) : (
        <ul className="market-grid">
          {visible.map((card) => (
            <li className="market-card" key={card.slug}>
              <div className="market-card-top">
                <span className="market-icon" aria-hidden="true">
                  {icons[card.slug] ?? "◆"}
                </span>
                <span className="market-version">v{card.version}</span>
              </div>
              <h2>
                <Link href={`/plugins/${card.slug}`}>{card.title}</Link>
              </h2>
              <p className="market-summary">{card.listSummary}</p>
              <div className="market-card-meta">
                <ul className="market-tags" aria-label="分类">
                  {card.categories.map((item) => (
                    <li key={item}>{categoryLabels[item] ?? item}</li>
                  ))}
                </ul>
                <span className="market-publisher">发布者 {card.publisher}</span>
              </div>
              <Link className="market-card-link" href={`/plugins/${card.slug}`}>
                查看详情 <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}