import { Suspense } from "react";
import ProductTabs from "@/components/product/ProductTabs";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <Suspense>
      <ProductTabs initialSearch={q} />
    </Suspense>
  );
}
