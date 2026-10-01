import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "@/lib/auth";
import type { Role } from "@/types";

interface Props {
  allowedRole: Role;
}

const ProtectedRoute = ({ allowedRole }: Props) => {
  const token = getToken(allowedRole);
  if (!token) {
    return <Navigate to={`/${allowedRole}/login`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;