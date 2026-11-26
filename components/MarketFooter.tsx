import { sitePath } from "@/lib/site-path";
import { siteCopy, type Locale } from "@/lib/locale";

export function MarketFooter({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>{copy.footer}</span>
        <a href={sitePath("/install", locale)}>{copy.about} →</a>
      </div>
    </footer>
  );
}
