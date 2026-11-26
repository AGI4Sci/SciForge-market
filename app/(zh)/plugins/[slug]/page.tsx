import type { Metadata } from "next";
import { sitePath } from "@/lib/site-path";
import { notFound } from "next/navigation";
import { catalogItems, getCatalogItem } from "@/lib/catalog-data";

export const dynamic = "force-static";
export const dynamicParams = false;

const pluginItems = catalogItems.filter((item) => item.kind === "plugin");

export function generateStaticParams() {
  return pluginItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  return item
    ? { title: `${item.title} · 地址已更新` }
    : { title: "资源不存在" };
}

export default async function LegacyPluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item || item.kind !== "plugin") notFound();

  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <p className="market-crumb"><a href={sitePath("/")}>← 返回目录</a></p>
          <h1>{item.title}</h1>
          <p className="market-lead">插件详情的新地址在下方。</p>
        </div>
      </section>
      <section className="market-body">
        <div className="install-shell">
          <div className="market-panel">
            <p><a className="inline-link" href={sitePath(`/catalog/${item.slug}`)}>查看新版详情 →</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}
