"use client";

import { usePathname } from "next/navigation";
import { catalogRoute, sitePath } from "@/lib/site-path";
import { siteCopy, type Locale } from "@/lib/locale";

export function MarketFooter({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  const onHelpPage = catalogRoute(usePathname(), locale).replace(/\/$/, "") === "/install";
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>{copy.footer}</span>
        <a href={sitePath(onHelpPage ? "/" : "/install", locale)}>
          {onHelpPage ? `← ${copy.back}` : `${copy.about} →`}
        </a>
      </div>
    </footer>
  );
}
