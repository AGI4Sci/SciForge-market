import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  catalogSnapshot,
  categoryLabels,
  catalogItems,
  getCatalogItem,
  catalogPath,
} from "@/lib/catalog-data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return catalogItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) return { title: "资源不存在" };
  return {
    title: `${item.title} · ${catalogSnapshot.kindLabels[item.kind]}`,
    description: item.summary,
    openGraph: {
      title: `${item.title} · SciForge 插件与能力目录`,
      description: item.summary,
    },
  };
}

export default async function CatalogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) notFound();
  const kindLabel = catalogSnapshot.kindLabels[item.kind];

  return (
    <main id="main-content">
      <section className="market-hero market-hero-detail">
        <div className="install-shell">
          <p className="market-crumb">
            <Link href="/">← 返回目录</Link>
          </p>
          <div className="catalog-detail-kicker">
            <span className={`catalog-kind kind-${item.kind}`}>{kindLabel}</span>
            <span className={`catalog-status status-${item.status}`}>{item.statusLabel}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="market-lead">{item.summary}</p>
          <p className="market-hero-meta">
            {item.categories.map((category) => categoryLabels[category] ?? category).join(" / ")}
          </p>
        </div>
      </section>

      <section className="market-body">
        <div className="install-shell">
          <article className="market-panel">
            <h2>{item.kind === "fixture" ? "验证目的" : item.kind === "skill" || item.kind === "template" ? "用途" : "核心能力"}</h2>
            <ul>
              {item.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>

            <h2>典型场景</h2>
            <ul>
              {item.scenarios.map((scenario) => <li key={scenario}>{scenario}</li>)}
            </ul>
          </article>

          <article className="market-panel">
            <h2>状态说明</h2>
            <p>{item.statusDetail}</p>
            <p className="market-note">
              本网站展示 SciForge 的插件与能力信息，暂不提供下载。目录中的“适配中”不等于已可安装或已发布。
            </p>
            {item.related.length > 0 ? (
              <>
                <h2>关联资源</h2>
                <ul className="catalog-related">
                  {item.related.map((related) => (
                    <li key={`${related.slug}-${related.relation}`}>
                      <Link href={catalogPath(related)}>{related.title}</Link>
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