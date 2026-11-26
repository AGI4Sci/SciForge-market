import { CatalogHome } from "@/components/CatalogHome";
import { siteCopy } from "@/lib/locale";

export const dynamic = "force-static";
export const metadata = { title: siteCopy.zh.catalog, description: siteCopy.zh.intro };

export default function Page() {
  return <CatalogHome locale="zh" />;
}
