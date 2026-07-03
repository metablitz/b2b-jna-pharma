import { Suspense } from "react";
import ProductTabs from "@/components/product/ProductTabs";
import ProductsAuthGate from "@/components/product/ProductsAuthGate";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <Suspense>
      <ProductsAuthGate>
        <ProductTabs initialSearch={q} />
      </ProductsAuthGate>
    </Suspense>
  );
}
