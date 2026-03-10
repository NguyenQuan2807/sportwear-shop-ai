import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Sportwear Shop
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>

            {user?.roleName === "ADMIN" && (
              <Link
                to="/admin"
                className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
              >
                Admin
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <span className="font-medium text-slate-700">{user.fullName}</span>
                <button
                  onClick={logout}
                  className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;