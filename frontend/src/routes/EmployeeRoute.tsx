import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import type { JSX } from "react";

export default function EmployeeRoute({ children }: { children: JSX.Element }) {
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "employee") return <Navigate to="/dashboard" replace />;

  return children;
}
