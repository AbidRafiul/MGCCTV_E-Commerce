import ProductHeader from "@/components/produk/ProductHeader";
import ProductList from "@/components/produk/ProductList";

export default function ProdukSection() {
  return (
    <div className="pt-28 bg-slate-50 min-h-screen">
      <ProductHeader />
      <ProductList />
    </div>
  );
}