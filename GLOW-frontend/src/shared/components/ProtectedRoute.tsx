import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: "teacher" | "student";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/user-role-selection" replace />;
  }

  let user: any;
  try {
    user = JSON.parse(userStr);
  } catch {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return <Navigate to="/user-role-selection" replace />;
  }

  if (user.role !== requiredRole) {
    if (user.role === "teacher") return <Navigate to="/teacher-profile" replace />;
    if (user.role === "student") return <Navigate to="/student-profile" replace />;
    return <Navigate to="/user-role-selection" replace />;
  }

  return <>{children}</>;
}