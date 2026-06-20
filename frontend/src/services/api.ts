const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  token?: string;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  let { requiresAuth = true, token, ...fetchOptions } = options;

  // Retrieve token from localStorage if not passed
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || undefined;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Include Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include",
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle response errors gracefully
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
  // Get current user
  getMe: (token?: string) =>
    apiRequest<{
      data: {
        user: {
          _id: string;
          name: string;
          email: string;
          phone: string;
          location: string;
          role: string;
          createdAt: string | number | Date;
          avatar?: string;
          bio?: string;
          companyId: string;
          linkedEmployees: string[];
        };
      };
    }>("/api/users/me", {
      method: "GET",
      token,
      credentials: "include",
    }),

  // Get all users (with email & employeeId)
  getUsers: (token?: string) =>
    apiRequest<{
      data: {
        total: number;
        users: Array<{
          _id: string;
          name: string;
          email: string;
          role: string;
          companyId: string;
          bio?: string;
          employeeId?: string;
          avatar?: string;
        }>;
      };
    }>("/api/users", { token }),

  // Get all shifts
  getShifts: (token?: string) =>
    apiRequest<{
      data: {
        shifts: Array<{
          _id: string;
          title: string;
          date: string;
          startTime: string;
          endTime: string;
          userId?: { name: string } | null;
          assignedTo: { userId?: string; name?: string };
          status: "SCHEDULED" | "COMPLETED" | "MISSED";
          totalHours?: number;
        }>;
        pagination: { total: number };
      };
    }>("/api/shifts", { token }),

  // Logout
  logout: (token?: string) =>
    apiRequest("/api/auth/logout", { method: "POST", token }),

  // Create new shift
  createShift: (data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
    );
    return apiRequest("/api/shifts", {
      method: "POST",
      body: JSON.stringify(cleanData),
    });
  },

  // Create new employee
  createEmployee: (data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
    );
    return apiRequest("/api/users/add-employee", {
      method: "POST",
      body: JSON.stringify(cleanData),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Get company by ID
  getCompany: (companyId: string) =>
    apiRequest<{
      data: {
        _id: string;
        name: string;
        location?: string;
        industry?: string;
        employeeCount?: number;
        createdAt?: string;
      };
    }>(`/api/companies/${companyId}`),

  // Get user by ID
  getUserById: (userId: string) =>
    apiRequest<{
      data: {
        user: {
          _id: string;
          name: string;
          email: string;
          phone?: string;
          role: string;
          department?: string;
          status?: "Permanent" | "Contract";
          avatar?: string;
          createdAt: string | number | Date;
          companyId: string;
          linkedEmployees?: string[];
        };
      };
    }>(`/api/users/${userId}`),

// Link employee to manager
linkEmployee: (employeeId: string) =>
  apiRequest<{
    success: boolean;
    message: string;
    data: {
      manager: any;
      employee: any;
    };
  }>(`/api/users/link-employee/${employeeId}`, {
    method: "POST",
    credentials: "include",
  }),

  // Search unlinked users (by name or ID)
searchUnlinkedUsers: (query: string, token?: string) =>
  apiRequest<{
    success: boolean;
    data: Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
      companyId: string | null;
      employeeId?: string;
      avatar?: string;
    }>;
  }>(`/api/users/search-unlinked?q=${encodeURIComponent(query)}`, {
    method: "GET",
    token,
  }),

// Update user profile
 updateProfile: (token: string, data: any) =>
  apiRequest("/api/users/me", {
    method: "PUT",
    token,
    credentials: "include",
    body: JSON.stringify(data),
  }),


  // Get logged-in user's shifts
getMyShifts: (token?: string) =>
  apiRequest<{
    success: boolean;
    data: {
      shifts: Array<{
        _id: string;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        status: "pending" | "confirmed" | "completed" | "cancelled";
        totalHours?: number;
      }>;
    };
  }>("/api/shifts/my", {
    method: "GET",
    token,
  }),

};