import Link from "next/link";

const PROJECT_URL = "https://github.com/AGI4Sci/SciForge";

export function MarketHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="SciForge 插件市场首页">
          <span className="brand-mark" aria-hidden="true">
            SF
          </span>
          <span className="brand-text">SciForge 插件市场</span>
          <span className="brand-tag">预览版</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link href="/">浏览插件</Link>
          <Link href="/install">安装指南</Link>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">
            SciForge 项目 <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}