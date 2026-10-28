import type { Metadata } from "next";
import Link from "next/link";
import { catalogSnapshot } from "@/lib/catalog-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "目录说明",
  description: "了解 SciForge 插件与能力目录的分类、状态和查看方式。",
  openGraph: {
    title: "目录说明 · SciForge 插件与能力目录",
    description: "了解 SciForge 插件与能力目录的分类、状态和查看方式。",
  },
};

export default function CatalogHelpPage() {
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <p className="market-eyebrow">SciForge · 公开目录</p>
          <h1>目录说明</h1>
          <p className="market-lead">这个网站用于浏览 SciForge 的插件、内置模块和开发资源。</p>
          <p className="install-boundary">
            本网站展示 SciForge 的插件与能力信息，暂不提供下载。
          </p>
        </div>
      </section>

      <section className="market-body">
        <div className="install-shell">
          <div className="market-panel">
            <h2>怎么看目录</h2>
            <ul>
              <li>按类型筛选：插件、内置模块、技能、模板或测试夹具。</li>
              <li>用搜索查找名称、用途、能力或典型场景。</li>
              <li>打开详情页查看核心能力、适用场景和当前适配状态。</li>
            </ul>
            <p className="market-note">
              当前公开目录共 {catalogSnapshot.total} 条：插件 {catalogSnapshot.counts.plugin}、内置模块 {catalogSnapshot.counts.builtin}、
              技能 {catalogSnapshot.counts.skill}、模板 {catalogSnapshot.counts.template}、测试夹具 {catalogSnapshot.counts.fixture}。
            </p>
            <p><Link className="inline-link" href="/">浏览全部资源 →</Link></p>
          </div>

          <div className="market-panel">
            <h2>状态含义</h2>
            <ul>
              <li><strong>部分功能已验证</strong>：测试构建中验证了部分能力，其他能力仍在适配。</li>
              <li><strong>适配中</strong>：已有候选制品或隔离激活结果，但真实宿主功能尚未完成。</li>
              <li><strong>随软件集成</strong>：随桌面应用提供的内置模块，不作为独立插件安装。</li>
              <li><strong>开发资源</strong>：技能、模板等开发辅助，不是产品运行时功能。</li>
              <li><strong>测试资源</strong>：用于验证行为的合成夹具，不是插件，也不供普通用户安装。</li>
            </ul>
            <p className="market-note">
              目录展示不代表插件已经可安装、已经发布或已经获得分发许可。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}