import { SiteLayout, siteMetadata } from "@/components/SiteLayout";

export const dynamic = "force-static";
export const metadata = siteMetadata("zh");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="zh">{children}</SiteLayout>;
}
