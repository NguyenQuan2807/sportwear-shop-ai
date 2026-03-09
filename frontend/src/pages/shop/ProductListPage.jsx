import { useEffect, useState } from "react";
import { getProductsApi } from "../../services/productService";
import ProductCard from "../../components/product/ProductCard";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getProductsApi();
      setProducts(response.data || []);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải danh sách sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Danh sách sản phẩm</h1>
        <p className="mt-2 text-slate-500">
          Khám phá các sản phẩm thời trang thể thao mới nhất
        </p>
      </div>

      {loading && (
        <div className="rounded-xl bg-white p-6 text-slate-600 shadow">
          Đang tải sản phẩm...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && products.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow">
          Chưa có sản phẩm nào.
        </div>
      )}

      {!loading && !errorMessage && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;