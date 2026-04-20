import { Link, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="min-h-screen w-64 bg-slate-900 p-4 text-white">
          <h2 className="mb-6 text-xl font-bold">Admin Panel</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/orders">Orders</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/categories">Categories</Link>
            <Link to="/admin/brands">Brands</Link>
            <Link to="/admin/sports">Sports</Link>
            <Link to="/admin/promotions">Promotions</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
