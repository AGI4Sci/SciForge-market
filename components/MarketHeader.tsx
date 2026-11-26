"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { catalogRoute, sitePath } from "@/lib/site-path";
import { siteCopy, type Locale } from "@/lib/locale";
import { applyTheme, loadTheme, parseTheme, THEME_KEY } from "@/lib/theme";

const PROJECT_URL = "https://github.com/AGI4Sci/SciForge";

export function MarketHeader({ locale }: { locale: Locale }) {
  const route = catalogRoute(usePathname(), locale);
  const copy = siteCopy[locale];
  const other = locale === "zh" ? "en" : "zh";
  const aboutActive = route.replace(/\/$/, "") === "/install";
  const themeSelect = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const select = themeSelect.current;
    const sync = () => {
      const theme = loadTheme();
      if (select) select.value = theme;
      applyTheme(theme);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("pageshow", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href={sitePath("/", locale)} aria-label={`SciForge · ${copy.catalog}`}>
          <span className="brand-mark" aria-hidden="true">SF</span>
          <span className="brand-text">SciForge</span>
        </a>
        <nav className="main-nav" aria-label={copy.nav}>
          <a href={sitePath("/", locale)} aria-current={!aboutActive ? "page" : undefined}>{copy.directory}</a>
          <a href={sitePath("/install", locale)} aria-current={aboutActive ? "page" : undefined}>{copy.about}</a>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        </nav>
        <div className="site-preferences">
          <label className="theme-select">
            <span className="visually-hidden" id="site-theme-label">{copy.theme}</span>
            <select ref={themeSelect} defaultValue="system" aria-labelledby="site-theme-label" onChange={(event) => {
              const theme = parseTheme(event.target.value);
              applyTheme(theme);
              try { localStorage.setItem(THEME_KEY, theme); } catch { /* Keep the current page choice. */ }
            }}>
              <option value="system">{copy.system}</option>
              <option value="light">{copy.light}</option>
              <option value="dark">{copy.dark}</option>
            </select>
          </label>
          <a className="language-link" href={sitePath(route, other)} lang={other === "en" ? "en" : "zh-CN"} hrefLang={other === "en" ? "en" : "zh-CN"}
            onClick={(event) => {
              if (route === "/") event.currentTarget.search = window.location.search;
            }}>
            {other === "en" ? "English" : "中文"}
          </a>
        </div>
      </div>
    </header>
  );
}
