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
import WishlistPage from "./pages/shop/WishlistPage";
import AccountPage from "./pages/shop/AccountPage";
import AuthEmailEntryPage from "./pages/auth/AuthEmailEntryPage";
import LoginPasswordPage from "./pages/auth/LoginPasswordPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ManageProductsPage from "./pages/admin/ManageProductsPage";
import ManageOrdersPage from "./pages/admin/ManageOrdersPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ManageCategoriesPage from "./pages/admin/ManageCategoriesPage";
import ManageBrandsPage from "./pages/admin/ManageBrandsPage";
import ManageSportsPage from "./pages/admin/ManageSportsPage";
import ManagePromotionsPage from "./pages/admin/ManagePromotionsPage";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<AuthEmailEntryPage />} />
      <Route path="/login/password" element={<LoginPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="orders" element={<ManageOrdersPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="brands" element={<ManageBrandsPage />} />
        <Route path="sports" element={<ManageSportsPage />} />
        <Route path="promotions" element={<ManagePromotionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
