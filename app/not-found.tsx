import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "页面不存在",
  description: "这个地址没有对应的页面，可能是链接过期或输入有误。",
  openGraph: {
    title: "页面不存在 · SciForge 插件与能力目录",
    description: "这个地址没有对应的页面，可能是链接过期或输入有误。",
  },
};

export default function NotFound() {
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <h1>页面不存在</h1>
          <p className="market-lead">这个地址没有对应的页面，可能是链接过期或输入有误。</p>
        </div>
      </section>
      <section className="market-body">
        <div className="install-shell">
          <div className="market-panel">
            <p>
              <Link className="inline-link" href="/">
                返回插件与能力目录
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}