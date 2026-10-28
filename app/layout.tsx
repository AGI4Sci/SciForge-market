import type { Metadata } from "next";
import "./globals.css";
import "./catalog.css";
import { MarketFooter } from "@/components/MarketFooter";
import { MarketHeader } from "@/components/MarketHeader";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: {
    default: "SciForge 插件与能力目录",
    template: "%s · SciForge 插件与能力目录",
  },
  description:
    "浏览 SciForge 的插件、内置模块、技能、模板与测试资源；展示能力与适配状态，不提供下载。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "SciForge 插件与能力目录",
    title: "SciForge 插件与能力目录",
    description: "浏览 SciForge 的插件、内置模块、技能、模板与测试资源；不提供下载。",
  },
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