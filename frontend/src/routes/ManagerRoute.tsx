import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import type { JSX } from "react";

export default function ManagerRoute({ children }: { children: JSX.Element }) {
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "manager") return <Navigate to="/employee-page" replace />;

  return children;
}
