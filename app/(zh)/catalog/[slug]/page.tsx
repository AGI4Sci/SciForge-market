import { CatalogDetail, detailMetadata } from "@/components/CatalogDetail";
import { catalogItems } from "@/lib/catalog-data";

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return catalogItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props) {
  return detailMetadata((await params).slug, "zh");
}

export default async function Page({ params }: Props) {
  return <CatalogDetail locale="zh" slug={(await params).slug} />;
}
