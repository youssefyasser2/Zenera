import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import type { JSX } from "react";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === "manager") return <Navigate to="/dashboard" replace />;
    if (user?.role === "employee") return <Navigate to="/employee-page" replace />;
  }

  return children;
}
