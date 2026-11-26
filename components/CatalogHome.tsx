import { CatalogDirectory } from "./MarketCatalog";
import { catalogItemsFor } from "@/lib/catalog-data";
import { siteCopy, type Locale } from "@/lib/locale";

export function CatalogHome({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  return (
    <main id="main-content">
      <section className="shell catalog-hero">
        <div className="catalog-hero-copy">
          <h1>{copy.catalog}</h1>
          <p>{copy.intro}</p>
        </div>
        <div className="catalog-hero-art" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </section>
      <section className="market-body">
        <div className="shell">
          <CatalogDirectory items={catalogItemsFor(locale)} locale={locale} />
        </div>
      </section>
    </main>
  );
}
