import { marketSnapshot } from "@/lib/market-data";

export function MarketFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p className="footer-brand">SciForge 插件市场</p>
        <details className="footer-details">
          <summary>数据说明</summary>
          <p>
            插件数据来自应用内市场的同一生成来源（{marketSnapshot.sourceFile}，生成于{" "}
            {marketSnapshot.generatedAt}，记录运行时 {marketSnapshot.dshRuntimeVersion}），
            本页为构建时快照；页面不访问后端，也不提供插件制品下载。
          </p>
        </details>
      </div>
    </footer>
  );
}