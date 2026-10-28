import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PluginActions } from "@/components/PluginActions";
import {
  categoryLabels,
  effectLabels,
  formatBytes,
  getPlugin,
  plugins,
} from "@/lib/market-data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return plugins.map((plugin) => ({ slug: plugin.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) return { title: "插件不存在" };
  return {
    title: plugin.title,
    description: plugin.summary,
    openGraph: {
      title: `${plugin.title} · SciForge 插件市场`,
      description: plugin.summary,
    },
  };
}

export default async function PluginDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();

  return (
    <main id="main-content">
      <section className="market-hero market-hero-detail">
        <div className="install-shell">
          <p className="market-crumb">
            <Link href="/">← 返回插件市场</Link>
          </p>
          <h1>{plugin.title}</h1>
          <p className="market-lead">{plugin.summary}</p>
          <p className="market-hero-meta">
            版本 {plugin.version} · 发布者 {plugin.publisher} ·{" "}
            {plugin.categories.map((item) => categoryLabels[item] ?? item).join(" / ")}
          </p>
        </div>
      </section>

      <section className="market-body">
        <div className="install-shell">
          <article className="market-panel">
            <h2>适用场景</h2>
            <ul>
              {plugin.useCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>已验证示例</h2>
            {plugin.examples.map((example) => (
              <figure key={example.title} className="market-example">
                <figcaption>{example.title}</figcaption>
                <pre>
                  <code>{example.body}</code>
                </pre>
              </figure>
            ))}
            <p className="market-note">
              示例已于 2026-10-27 在插件实现上运行核对；工具调用格式仅供开发者参考。
            </p>
          </article>

          <article className="market-panel">
            <h2>安装</h2>
            <p>
              在 SciForge 桌面端安装：扩展中心 → 市场 → 搜索插件 → 核对权限 → 批准并安装。
            </p>
            <PluginActions pluginId={plugin.name} />
            <p className="market-note">
              <Link href={`/install?plugin=${plugin.slug}`}>查看安装指南 →</Link>
            </p>
            <p className="market-note">
              当前公开发行版（v0.2.16）尚未包含插件市场入口；以上步骤适用于包含市场的构建。预览版不提供插件包下载。
            </p>
          </article>

          <article className="market-panel">
            <h2>权限与兼容性</h2>
            <table className="market-table">
              <thead>
                <tr>
                  <th scope="col">工具</th>
                  <th scope="col">效果</th>
                </tr>
              </thead>
              <tbody>
                {plugin.tools.map((tool) => (
                  <tr key={tool.id}>
                    <td>
                      <code>{tool.name}</code>
                    </td>
                    <td>{effectLabels[tool.effect]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="market-note">宿主依赖：{plugin.hostDependencies.join("、")}</p>
            <p className="market-note">{plugin.compatibility}</p>
            {plugin.notes.length > 0 ? (
              <ul className="market-notes">
                {plugin.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}
          </article>

          <details className="market-details market-technical">
            <summary>技术信息（工具 ID、哈希、签名与许可）</summary>
            <div className="details-body">
              <table className="market-table">
                <thead>
                  <tr>
                    <th scope="col">工具</th>
                    <th scope="col">能力 ID</th>
                  </tr>
                </thead>
                <tbody>
                  {plugin.tools.map((tool) => (
                    <tr key={tool.id}>
                      <td>
                        <code>{tool.name}</code>
                      </td>
                      <td>
                        <code>{tool.id}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="market-meta">
                <div>
                  <dt>包大小</dt>
                  <dd>{formatBytes(plugin.sizeBytes)}</dd>
                </div>
                <div>
                  <dt>插件 ID</dt>
                  <dd>
                    <code>{plugin.name}</code>
                  </dd>
                </div>
                <div>
                  <dt>SHA-256</dt>
                  <dd className="market-sha">{plugin.sha256}</dd>
                </div>
                <div>
                  <dt>签名</dt>
                  <dd>
                    {plugin.signature
                      ? `${plugin.signature.algorithm} · 发布者 ${plugin.signature.publisherId}（由桌面端安装时校验）`
                      : "待补（未能读取签名元数据）"}
                  </dd>
                </div>
                <div>
                  <dt>许可证</dt>
                  <dd>{plugin.license}</dd>
                </div>
              </dl>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}