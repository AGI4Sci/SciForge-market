"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryLabels, type MarketCard } from "@/lib/market-data";

const icons: Readonly<Record<string, string>> = {
  "text-stats": "Aa",
  "unit-conversion": "⇄",
};

function matches(card: MarketCard, query: string) {
  if (query.length === 0) return true;
  const haystack = [
    card.name,
    card.title,
    card.listSummary,
    card.publisher,
    ...card.categories.map((category) => categoryLabels[category] ?? category),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function MarketCatalog({ items }: { items: readonly MarketCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(items.flatMap((card) => card.categories))),
    [items],
  );

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(
      (card) =>
        matches(card, normalized) &&
        (category === "all" || card.categories.includes(category)),
    );
  }, [items, query, category]);

  const activeLabel = category === "all" ? "全部插件" : (categoryLabels[category] ?? category);

  return (
    <div className="market-catalog">
      <label className="market-search">
        <span className="visually-hidden">搜索插件</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索插件…"
        />
      </label>

      <div className="market-chips" role="group" aria-label="按分类筛选">
        <button
          type="button"
          className={`market-chip${category === "all" ? " is-active" : ""}`}
          aria-pressed={category === "all"}
          onClick={() => setCategory("all")}
        >
          全部
        </button>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`market-chip${category === item ? " is-active" : ""}`}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {categoryLabels[item] ?? item}
          </button>
        ))}
      </div>

      <p className="market-count" aria-live="polite">
        {`${activeLabel} · ${visible.length}`}
      </p>

      {visible.length === 0 ? (
        <p className="market-empty">没有匹配的插件。</p>
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