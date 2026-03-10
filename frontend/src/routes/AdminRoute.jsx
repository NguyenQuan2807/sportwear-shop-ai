import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.roleName !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;