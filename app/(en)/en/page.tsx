import { CatalogHome } from "@/components/CatalogHome";
import { siteCopy } from "@/lib/locale";

export const dynamic = "force-static";
export const metadata = { title: siteCopy.en.catalog, description: siteCopy.en.intro };

export default function Page() {
  return <CatalogHome locale="en" />;
}
