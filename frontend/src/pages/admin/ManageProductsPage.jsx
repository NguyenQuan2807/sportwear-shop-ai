import { useEffect, useState } from "react";
import {
  createAdminProductApi,
  deleteAdminProductApi,
  getAdminProductDetailApi,
  getAdminProductsApi,
  updateAdminProductApi,
} from "../../services/adminProductService";
import AdminProductForm from "../../components/product/AdminProductForm";

const ManageProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminProductsApi();
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

  const handleCreateClick = () => {
    setEditingProduct(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditClick = async (id) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await getAdminProductDetailApi(id);
      setEditingProduct(response.data);
      setShowForm(true);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể tải chi tiết sản phẩm";
      setErrorMessage(backendMessage);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");
    if (!confirmed) return;

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAdminProductApi(id);
      setSuccessMessage("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể xóa sản phẩm";
      setErrorMessage(backendMessage);
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (editingProduct) {
        await updateAdminProductApi(editingProduct.id, formData);
        setSuccessMessage("Cập nhật sản phẩm thành công");
      } else {
        await createAdminProductApi(formData);
        setSuccessMessage("Tạo sản phẩm thành công");
      }

      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Không thể lưu sản phẩm";
      setErrorMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Quản lý sản phẩm
          </h1>
          <p className="mt-2 text-slate-500">
            Thêm, sửa, xóa sản phẩm trong hệ thống
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Thêm sản phẩm
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-green-100 p-4 text-green-700 shadow">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-4 text-red-600 shadow">
          {errorMessage}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            {editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
          </h2>

          <AdminProductForm
            initialData={editingProduct}
            onSubmit={handleSubmitForm}
            submitting={submitting}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow">
        {loading ? (
          <div className="p-6">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-slate-500">Chưa có sản phẩm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Danh mục</th>
                  <th className="px-4 py-3 text-left">Thương hiệu</th>
                  <th className="px-4 py-3 text-left">Môn</th>
                  <th className="px-4 py-3 text-left">Giới tính</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{product.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">{product.categoryName}</td>
                    <td className="px-4 py-3">{product.brandName}</td>
                    <td className="px-4 py-3">{product.sportName}</td>
                    <td className="px-4 py-3">{product.gender}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {product.isActive ? "Đang bán" : "Ngừng bán"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(product.id)}
                          className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-500"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProductsPage;