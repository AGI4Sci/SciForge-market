"use client";

import { sitePath } from "@/lib/site-path";
import { siteCopy, kindLabels, type Locale } from "@/lib/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  categoryLabel,
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

export function CatalogDirectory({ items, locale }: { items: readonly CatalogItem[]; locale: Locale }) {
  const copy = siteCopy[locale];
  const labels = kindLabels[locale];
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
  const activeLabel = state.kind === "all" ? null : labels[state.kind as keyof CatalogCounts];
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
      <section className="catalog-controls" aria-label={copy.controls}>
        <div className="market-search">
          <label className="visually-hidden" htmlFor="market-search-input">
            {copy.search}
          </label>
          <span className="search-icon" aria-hidden="true" />
          <input
            id="market-search-input"
            ref={searchInput}
            type="search"
            maxLength={120}
            value={state.query}
            onChange={(event) => commit({ ...state, query: event.target.value }, "replace")}
            placeholder={copy.search}
          />
          {state.query ? (
            <button type="button" className="market-search-clear" onClick={() => {
              commit({ ...state, query: "" }, "replace");
              searchInput.current?.focus();
            }}>
              {copy.clear}
            </button>
          ) : null}
        </div>

        <div className="market-chips" role="group" aria-label={copy.kindFilter}>
          {["all", ...allowed.kinds].map((kind) => (
            <button
              key={kind}
              type="button"
              className="market-chip"
              aria-pressed={state.kind === kind}
              onClick={() => commit({ ...state, kind }, "push")}
            >
              {kind === "all" ? copy.directory : labels[kind as keyof CatalogCounts]}{" "}
              <span>{kind === "all" ? catalogSnapshot.total : kindCounts[kind as keyof CatalogCounts]}</span>
            </button>
          ))}
        </div>

        <div className="catalog-selects">
          <div className="catalog-select">
            <label htmlFor="catalog-category">{copy.category}</label>
            <select
              id="catalog-category"
              value={state.category}
              onChange={(event) => commit({ ...state, category: event.target.value }, "push")}
            >
              <option value="all">{copy.anyCategory}</option>
              {allowed.categories.map((category) => (
                <option key={category} value={category}>{categoryLabel(category, locale)}</option>
              ))}
            </select>
          </div>
          <div className="catalog-select">
            <label htmlFor="catalog-status">{copy.status}</label>
            <select
              id="catalog-status"
              value={state.status}
              onChange={(event) => commit({ ...state, status: event.target.value }, "push")}
            >
              <option value="all">{copy.anyStatus}</option>
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
          <strong>{copy.result(visible.length)}</strong>
          {resultContext ? <span>{resultContext}</span> : null}
        </p>
        {filtered && visible.length > 0 ? (
          <button type="button" className="catalog-reset" onClick={reset}>
            {copy.reset}
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="market-empty">
          <h2>{copy.empty}</h2>
          <p>{copy.emptyHint}</p>
          <button type="button" className="market-action" onClick={reset}>
            {copy.reset}
          </button>
        </div>
      ) : (
        <ul className="market-grid">
          {visible.map((item) => (
            <li className="market-card" key={item.slug} data-kind={item.kind}>
              <div className="market-card-top">
                <span className={`catalog-kind kind-${item.kind}`}>{labels[item.kind]}</span>
                <span className={`catalog-status status-${statusTone[item.status]}`}>{item.statusLabel}</span>
              </div>
              <h2><a href={sitePath(`/catalog/${item.slug}`, locale)}>{item.title}</a></h2>
              <p className="market-summary">{item.summary}</p>
              <div className="market-card-meta">
                <ul className="market-tags" aria-label={copy.category}>
                  {item.categories.slice(0, 3).map((category) => (
                    <li key={category}>{categoryLabel(category, locale)}</li>
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
