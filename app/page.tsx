import type { Metadata } from "next";
import { CatalogDirectory } from "@/components/MarketCatalog";
import { catalogItems } from "@/lib/catalog-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "插件与能力目录",
  description: "浏览 SciForge 的插件、内置模块、技能、模板与测试资源；本网站暂不提供下载。",
  openGraph: {
    title: "SciForge 插件与能力目录",
    description: "浏览 SciForge 的插件、内置模块、技能、模板与测试资源；本网站暂不提供下载。",
  },
};

export default function Home() {
  return (
    <main id="main-content">
      <section className="shell catalog-hero">
        <div className="catalog-hero-copy">
          <h1>插件与能力目录</h1>
          <p>浏览 SciForge 插件、内置模块和开发资源。</p>
          <small>公开展示 · 暂不提供下载</small>
        </div>
        <div className="catalog-hero-art" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </section>

      <section className="market-body">
        <div className="shell">
          <CatalogDirectory items={catalogItems} />
        </div>
      </section>
    </main>
  );
}
