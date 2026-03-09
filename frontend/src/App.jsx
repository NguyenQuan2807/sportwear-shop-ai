import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import HomePage from "./pages/shop/HomePage";
import ProductListPage from "./pages/shop/ProductListPage";
import ProductDetailPage from "./pages/shop/ProductDetailPage";
import CartPage from "./pages/shop/CartPage";
import CheckoutPage from "./pages/shop/CheckoutPage";
import OrderHistoryPage from "./pages/shop/OrderHistoryPage";
import OrderDetailPage from "./pages/shop/OrderDetailPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardPage from "./pages/admin/DashboardPage";
import ManageProductsPage from "./pages/admin/ManageProductsPage";
import ManageOrdersPage from "./pages/admin/ManageOrdersPage";
import ManageCategoriesPage from "./pages/admin/ManageCategoriesPage";
import ManageBrandsPage from "./pages/admin/ManageBrandsPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="brands" element={<ManageBrandsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;