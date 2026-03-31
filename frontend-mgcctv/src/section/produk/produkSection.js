import ProductHeader from "@/components/produk/ProductHeader";
import ProductList from "@/components/produk/ProductList";

export default function ProdukSection() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 sm:pt-36">
      <ProductHeader />
      <ProductList />
    </div>
  );
}
