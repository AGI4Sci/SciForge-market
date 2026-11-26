"use client";

import { sitePath } from "@/lib/site-path";
import { usePathname } from "next/navigation";

const PROJECT_URL = "https://github.com/AGI4Sci/SciForge";

export function MarketHeader() {
  const path = usePathname();
  const installActive = path.split("/").includes("install");

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href={sitePath("/")} aria-label="SciForge 插件与能力目录首页">
          <span className="brand-mark" aria-hidden="true">
            SF
          </span>
          <span className="brand-text">SciForge 目录</span>
        </a>
        <nav className="main-nav" aria-label="主导航">
          <a href={sitePath("/")} aria-current={!installActive ? "page" : undefined}>
            全部资源
          </a>
          <a href={sitePath("/install")} aria-current={installActive ? "page" : undefined}>
            目录说明
          </a>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
