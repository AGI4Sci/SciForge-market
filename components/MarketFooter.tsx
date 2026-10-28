import { catalogSnapshot } from "@/lib/catalog-data";

export function MarketFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p className="footer-brand">SciForge 插件与能力目录</p>
        <details className="footer-details">
          <summary>目录说明</summary>
          <p>
            目录为构建时快照（生成于 {catalogSnapshot.generatedAt}）。展示插件、内置模块与开发资源的能力和适配状态，
            不提供下载、安装入口或制品文件。
          </p>
        </details>
      </div>
    </footer>
  );
}