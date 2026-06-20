import { Navigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import type { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
