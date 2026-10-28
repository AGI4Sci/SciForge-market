import type { Metadata } from "next";
import { MarketCatalog } from "@/components/MarketCatalog";
import { marketCards } from "@/lib/market-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "发现科研插件（预览版）",
  description: "为 SciForge 添加实用工具与科研能力。",
  openGraph: {
    title: "发现科研插件 · SciForge 插件市场",
    description: "为 SciForge 添加实用工具与科研能力。",
  },
};

export default function Home() {
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="shell">
          <h1>发现科研插件</h1>
          <p className="market-lead">为 SciForge 添加实用工具与科研能力。</p>
        </div>
      </section>

      <section className="market-body">
        <div className="shell">
          <MarketCatalog items={marketCards} />
        </div>
      </section>
    </main>
  );
}