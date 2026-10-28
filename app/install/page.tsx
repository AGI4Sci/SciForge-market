import type { Metadata } from "next";
import { InstallTarget } from "@/components/InstallTarget";
import { marketSnapshot, plugins } from "@/lib/market-data";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "安装插件",
  description: "在 SciForge 桌面端安装插件：打开市场、找到插件、确认权限。",
  openGraph: {
    title: "安装插件 · SciForge 插件市场",
    description: "在 SciForge 桌面端安装插件：打开市场、找到插件、确认权限。",
  },
};

const targets = plugins.map((plugin) => ({
  slug: plugin.slug,
  name: plugin.name,
  title: plugin.title,
}));

export default function InstallHelpPage() {
  return (
    <main id="main-content">
      <section className="market-hero">
        <div className="install-shell">
          <h1>安装插件</h1>
          <p className="market-lead">在 SciForge 桌面端完成安装。</p>
          <p className="install-boundary">请在 SciForge 桌面端安装。预览版暂不提供插件包下载。</p>
          <p className="install-status">
            公开发行版核对（2026-10-27）：v0.2.16 安装包内<strong>没有</strong>插件市场入口与默认索引。
            以下步骤适用于包含市场的构建（开发构建或后续版本）；如果你的版本没有市场入口，说明它尚未包含该能力。
          </p>
        </div>
      </section>

      <section className="market-body">
        <div className="install-shell">
          <InstallTarget targets={targets} />

          <ol className="install-steps">
            <li>
              <span className="step-num" aria-hidden="true">
                1
              </span>
              <div>
                <h2>打开扩展中心</h2>
                <p>打开 SciForge，在左侧栏进入「扩展中心」。</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">
                2
              </span>
              <div>
                <h2>找到插件</h2>
                <p>打开「市场」，搜索插件名称或插件 ID。</p>
              </div>
            </li>
            <li>
              <span className="step-num" aria-hidden="true">
                3
              </span>
              <div>
                <h2>确认权限</h2>
                <p>核对工具与效果清单，批准后完成安装。</p>
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
                <p>先确认版本包含市场入口（扩展中心 → 市场）；v0.2.16 公开发行版不包含该入口。</p>
                <p>如果你的版本有市场，但仍搜不到：核对插件名称或插件 ID，确认默认索引包含该插件。</p>
              </div>
            </details>
            <details>
              <summary>版本不兼容？</summary>
              <div className="details-body">
                <p>
                  对照详情页「兼容性」的 DSH 版本范围；不匹配时不要安装，等待插件或宿主更新。
                </p>
              </div>
            </details>
            <details>
              <summary>校验失败？</summary>
              <div className="details-body">
                <p>
                  制品字节数、SHA-256 或发布者签名任一不符都会拒绝安装；按桌面端提示处理，
                  不要尝试绕过校验或信任限制。
                </p>
              </div>
            </details>
            <details>
              <summary>兼容性与安全校验</summary>
              <div className="details-body">
                <p>
                  当前索引记录的运行时版本为 {marketSnapshot.dshRuntimeVersion}；
                  安装时由桌面端校验制品字节数、SHA-256 与发布者签名（Ed25519）。
                </p>
              </div>
            </details>
          </div>

          <p className="market-note">
            本站不执行插件安装，安装与校验由 SciForge 桌面端完成。当前只收录本站目录中的两个已公开插件，
            不提供其他构建或插件的获取入口。
          </p>
        </div>
      </section>
    </main>
  );
}