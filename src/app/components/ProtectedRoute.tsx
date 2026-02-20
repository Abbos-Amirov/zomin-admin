import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGlobals } from "../hooks/useGlobals";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authMember } = useGlobals();
  const location = useLocation();

  if (!authMember) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

