import type { Metadata } from "next";
import Link from "next/link";
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
          <p className="market-crumb"><Link href="/">← 返回目录</Link></p>
          <h1>{item.title}</h1>
          <p className="market-lead">这个旧地址仍然可以访问；插件详情已移到新的目录页面。</p>
        </div>
      </section>
      <section className="market-body">
        <div className="install-shell">
          <div className="market-panel">
            <p><Link className="inline-link" href={`/catalog/${item.slug}`}>查看新版详情 →</Link></p>
            <p className="market-note">本网站只展示能力与适配信息，不提供插件包下载或安装入口。</p>
          </div>
        </div>
      </section>
    </main>
  );
}