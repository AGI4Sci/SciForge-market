import { CatalogHelp } from "@/components/CatalogHelp";
import { siteCopy } from "@/lib/locale";

export const dynamic = "force-static";
export const metadata = { title: siteCopy.zh.about };

export default function Page() {
  return <CatalogHelp locale="zh" />;
}
