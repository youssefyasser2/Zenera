// src/utils/auth/validation.utils.ts
import type { LoginCredentials, RegisterCredentials } from "@/types/auth.types";

export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validateLogin = (data: LoginCredentials): string[] => {
  const errors: string[] = [];
  if (!data.email) errors.push("Email is required");
  else if (!validateEmail(data.email)) errors.push("Invalid email format");
  if (!data.password) errors.push("Password is required");
  return errors;
};


export const validateRegister = (
  data: RegisterCredentials
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email";
  }

  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

export const getPasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
};