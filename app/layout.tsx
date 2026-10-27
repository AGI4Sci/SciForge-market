import type { Metadata } from "next";
import "./globals.css";
import { MarketFooter } from "@/components/MarketFooter";
import { MarketHeader } from "@/components/MarketHeader";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    default: "SciForge 插件市场",
    template: "%s · SciForge 插件市场",
  },
  description:
    "浏览 SciForge 官方插件：用途、权限、兼容版本与安装方式。预览版不提供制品下载。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <a className="skip-link" href="#main-content">
          跳到正文
        </a>
        <MarketHeader />
        {children}
        <MarketFooter />
      </body>
    </html>
  );
}