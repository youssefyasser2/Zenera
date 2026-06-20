"use client";

import { toaster } from "@/components/ui/toaster";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth.types";
import { validateLogin, validateRegister } from "@/utils/validation.utils";

const API_URL = import.meta.env.VITE_BASE_URL;

class AuthService {
  private showErrors(errors: string[]) {
    errors.forEach((err) => {
      toaster.create({
        title: "Validation Error",
        description: err,
        type: "error",
        duration: 3000,
      });
    });
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ user: any; accessToken: string }> {
    const errors = validateLogin(credentials);
    if (errors.length > 0) {
      this.showErrors(errors);
      throw new Error(errors[0]);
    }

    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(true),
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data = await res.json();
      const msg = data.message || "Login failed";
      toaster.create({
        title: "Login Failed",
        description: msg,
        type: "error",
      });
      throw new Error(msg);
    }

    const data: AuthResponse = await res.json();
    const { user, accessToken } = data.data;

    this.saveAuth(user, accessToken);
    toaster.create({ title: "Welcome back!", type: "success", duration: 2000 });

    return { user, accessToken };
  }

  async register(
    credentials: RegisterCredentials
  ): Promise<{ user: any; accessToken: string }> {
    const errors = validateRegister(credentials);
    if (Object.keys(errors).length > 0) {
      this.showErrors(Object.values(errors));
      throw new Error(Object.values(errors)[0]);
    }

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(true),
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.message || "Registration failed";
      toaster.create({
        title: "Error",
        description: msg,
        type: "error",
      });
      throw new Error(msg);
    }

    const user = data.data?.user || data.user;
    const accessToken = data.data?.accessToken || data.accessToken || "";

    this.saveAuth(user, accessToken);

    toaster.create({
      title: "Account created!",
      type: "success",
      duration: 2000,
    });

    return { user, accessToken };
  }

  private saveAuth(user: AuthResponse["data"]["user"], accessToken: string) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
  }

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }

  getUser(): AuthResponse["data"]["user"] | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getUser() && !!localStorage.getItem("accessToken");
  }

  private getCsrfToken(): string | undefined {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : undefined;
  }

  private getHeaders(includeCsrf: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (includeCsrf) {
      const csrf = this.getCsrfToken();
      if (csrf) {
        headers["X-CSRF-Token"] = csrf;
      }
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { includeCsrf?: boolean } = {}
  ): Promise<T> {
    const { includeCsrf = false, ...fetchOptions } = options;
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      credentials: "include",
      headers: {
        ...fetchOptions.headers,
        ...this.getHeaders(includeCsrf),
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Request failed");
    }

    return res.json();
  }
}

export const authService = new AuthService();
