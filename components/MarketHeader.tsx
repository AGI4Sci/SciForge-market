"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PROJECT_URL = "https://github.com/AGI4Sci/SciForge";

export function MarketHeader() {
  const [path, setPath] = useState("");

  useEffect(() => {
    const apply = () => setPath(window.location.pathname);
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  const installActive = path.includes("/install");
  const browseActive = path !== "" && !installActive;

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="SciForge 插件与能力目录首页">
          <span className="brand-mark" aria-hidden="true">
            SF
          </span>
          <span className="brand-text">SciForge 目录</span>
          <span className="brand-tag">公开</span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link href="/" aria-current={browseActive ? "page" : undefined}>
            全部资源
          </Link>
          <Link href="/install" aria-current={installActive ? "page" : undefined}>
            目录说明
          </Link>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">
            SciForge 项目 <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}