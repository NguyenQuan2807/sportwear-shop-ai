import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      {isHomePage ? (
        <main className="min-h-[60vh]">
          <Outlet />
        </main>
      ) : (
        <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      )}

      <Footer />
    </div>
  );
};

export default MainLayout;