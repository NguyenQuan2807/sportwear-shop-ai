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

          <nav className="flex gap-4">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>

            {!user ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <span>{user.fullName}</span>
                <button onClick={logout} className="text-red-500">
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