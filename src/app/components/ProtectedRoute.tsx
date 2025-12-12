import { Navigate } from "react-router-dom";
import { useGlobals } from "../hooks/useGlobals";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authMember } = useGlobals();

  if (!authMember) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

