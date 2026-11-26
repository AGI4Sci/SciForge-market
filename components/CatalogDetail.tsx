import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogPath, categoryLabel, getCatalogItem, statusTone } from "@/lib/catalog-data";
import { kindLabels, siteCopy, type Locale } from "@/lib/locale";
import { sitePath } from "@/lib/site-path";

export function detailMetadata(slug: string, locale: Locale): Metadata {
  const item = getCatalogItem(slug, locale);
  if (!item) return { title: locale === "zh" ? "资源不存在" : "Resource not found" };
  return {
    title: `${item.title} · ${kindLabels[locale][item.kind]}`,
    description: item.summary,
    openGraph: { title: `${item.title} · SciForge`, description: item.summary },
  };
}

export function CatalogDetail({ locale, slug }: { locale: Locale; slug: string }) {
  const item = getCatalogItem(slug, locale);
  if (!item) notFound();
  const copy = siteCopy[locale];
  const featureHeading = item.kind === "fixture" ? copy.testPurpose : item.kind === "skill" || item.kind === "template" ? copy.purpose : copy.features;
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <p className="market-crumb"><a href={sitePath("/", locale)}>← {copy.back}</a></p>
          <div className="catalog-detail-kicker">
            <span className={`catalog-kind kind-${item.kind}`}>{kindLabels[locale][item.kind]}</span>
            <span className={`catalog-status status-${statusTone[item.status]}`}>{item.statusLabel}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="market-lead">{item.summary}</p>
          <p className="market-hero-meta">{item.categories.map((category) => categoryLabel(category, locale)).join(" / ")}</p>
        </div>
      </section>
      <section className="market-body">
        <div className="install-shell market-detail-grid">
          <article className="market-panel">
            <h2>{featureHeading}</h2>
            <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <h2>{copy.examples}</h2>
            <ul>{item.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}</ul>
          </article>
          <article className="market-panel">
            <h2>{copy.statusDetail}</h2>
            <p>{item.statusDetail}</p>
            {item.related.length > 0 ? (
              <>
                <h2>{copy.related}</h2>
                <ul className="catalog-related">
                  {item.related.map((related) => (
                    <li key={related.slug}>
                      <a href={sitePath(catalogPath(related), locale)}>{related.title}</a>
                      <span>{related.relation}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
