import { sitePath } from "@/lib/site-path";

export function MarketFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>SciForge</span>
        <a href={sitePath("/install")}>目录说明 →</a>
      </div>
    </footer>
  );
}
