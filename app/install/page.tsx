import type { Metadata } from "next";
import { marketSnapshot } from "@/lib/market-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "安装插件",
  description: "在 SciForge 桌面端完成插件安装：打开市场、找到插件、确认权限。",
};

export default function InstallHelpPage() {
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <h1>安装插件</h1>
          <p className="market-lead">在 SciForge 桌面端完成安装。</p>
          <p className="install-boundary">请在 SciForge 桌面端安装。预览版暂不提供插件包下载。</p>
        </div>
      </section>

      <section className="market-body">
        <div className="install-shell">
          <ol className="install-steps">
            <li>
              <span className="step-num" aria-hidden="true">
                1
              </span>
              <div>
                <h2>打开市场</h2>
                <p>打开 SciForge → 扩展中心 → 市场。</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">
                2
              </span>
              <div>
                <h2>找到插件</h2>
                <p>搜索插件名称，点击 Install。</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">
                3
              </span>
              <div>
                <h2>确认权限</h2>
                <p>查看权限提示，确认后完成安装。</p>
              </div>
            </li>
          </ol>

          <p className="install-note">
            仅批准你理解的权限；校验失败时，请按桌面端提示处理。
          </p>

          <div className="market-details">
            <details>
              <summary>找不到插件？</summary>
              <div className="details-body">
                <p>确认桌面端版本包含市场入口（扩展中心 → 市场），并在市场中搜索插件名称。</p>
                <p>若仍看不到，请使用你所在版本的默认索引，或联系维护者。</p>
              </div>
            </details>
            <details>
              <summary>安装失败怎么办？</summary>
              <div className="details-body">
                <p>
                  制品校验失败、发布者签名不受信任或权限不匹配都会拒绝安装，不会降级放行；
                  请按桌面端提示处理。
                </p>
              </div>
            </details>
            <details>
              <summary>兼容性与安全校验</summary>
              <div className="details-body">
                <p>
                  插件声明的兼容范围与索引记录的运行时版本见插件详情页「兼容版本」；
                  当前索引记录的运行时版本为 {marketSnapshot.dshRuntimeVersion}。
                </p>
                <p>
                  安装时由桌面端校验制品字节数、SHA-256 与发布者签名（Ed25519），
                  全部通过后才会安装。
                </p>
              </div>
            </details>
          </div>

          <p className="market-note">本站不执行插件安装，安装与校验由 SciForge 桌面端完成。</p>
        </div>
      </section>
    </main>
  );
}