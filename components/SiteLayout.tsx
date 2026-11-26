import type { Metadata } from "next";
import "@/app/globals.css";
import "@/app/catalog.css";
import "@/app/theme.css";
import { MarketFooter } from "./MarketFooter";
import { MarketHeader } from "./MarketHeader";
import { siteCopy, type Locale } from "@/lib/locale";
import { themeInit } from "@/lib/theme";

export function siteMetadata(locale: Locale): Metadata {
  const copy = siteCopy[locale];
  return {
    title: { default: `SciForge · ${copy.catalog}`, template: "%s · SciForge" },
    description: copy.intro,
    openGraph: {
      type: "website", locale: locale === "zh" ? "zh_CN" : "en_US",
      siteName: `SciForge · ${copy.catalog}`, title: `SciForge · ${copy.catalog}`, description: copy.intro,
    },
  };
}

export function SiteLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <a className="skip-link" href="#main-content">{siteCopy[locale].skip}</a>
        <MarketHeader locale={locale} />
        {children}
        <MarketFooter locale={locale} />
      </body>
    </html>
  );
}
