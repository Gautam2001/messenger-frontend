// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData") || "null");
  const token = loginData?.accessToken;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
