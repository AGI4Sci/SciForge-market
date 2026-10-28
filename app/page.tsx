import type { Metadata } from "next";
import { CatalogDirectory } from "@/components/MarketCatalog";
import { catalogItems, catalogSnapshot } from "@/lib/catalog-data";

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
      <section className="market-hero">
        <div className="shell">
          <p className="market-eyebrow">SciForge · 公开目录</p>
          <h1>插件与能力目录</h1>
          <p className="market-lead">
            浏览 SciForge 的插件、内置模块、技能、模板与测试资源。展示的是能力与适配状态，不代表已开放安装或下载。
          </p>
          <p className="catalog-hero-count">
            {catalogSnapshot.total} 个公开条目 · 插件 {catalogSnapshot.counts.plugin} · 内置模块 {catalogSnapshot.counts.builtin}
          </p>
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