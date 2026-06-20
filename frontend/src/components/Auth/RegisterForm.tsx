"use client";

import { Box, Button, Text, Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "@/store";
import { registerThunk } from "@/services/auth/auth.thunk";
import InputField from "../ui/Fields/InputField";
import PasswordField from "../ui/Fields/PasswordField";

interface RegisterFormProps {
  onLogin: () => void;
}

export default function RegisterForm({ onLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmployee, setIsEmployee] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // Detect role based on URL path
  useEffect(() => {
    if (location.pathname.includes("/employee/register")) {
      setIsEmployee(true);
      setFormData((prev) => ({ ...prev, companyName: "" }));
    } else {
      setIsEmployee(false);
    }
  }, [location.pathname]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Prepare data depending on user type
      const dataToSend = isEmployee
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        : formData;

      const result = await dispatch(registerThunk(dataToSend) as any);

      if (registerThunk.fulfilled.match(result)) {
        console.log("✅ Registration successful:", result.payload);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        console.log("❌ Registration failed:", result);
        setErrors({ general: "Registration failed" });
      }
    } catch (error: any) {
      if (error && typeof error === "object") {
        setErrors(error);
      }
    }
  };

  // Handle input change
  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  return (
    <Box maxW="480px" w="100%" mx="auto">
      <Heading
        fontSize={{ base: "2xl", md: "3xl", lg: "40px" }}
        fontWeight="bold"
        mb={3}
        lineHeight="1.2"
        color="#1A202C"
      >
        {isEmployee ? "Join as Employee" : "Join as Manager"}
      </Heading>

      <Text color="#718096" mb={8} lineHeight="1.6" fontSize="14px">
        {isEmployee
          ? "Register now to access your employee dashboard and start collaborating."
          : "Register your company and start managing your team efficiently."}
      </Text>

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <Box mb={4}>
          <InputField
            label="Full name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange("name")}
            required
            bg="white"
            borderColor={errors.name ? "red.500" : "#CBD5E0"}
            color="#1A202C"
            placeholderColor="#718096"
            labelColor="#4A5568"
            disabled={isLoading}
            autoComplete="name"
          />
          {errors.name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.name}
            </Text>
          )}
        </Box>

        {/* Email */}
        <Box mb={4}>
          <InputField
            label="Email address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            required
            bg="white"
            borderColor={errors.email ? "red.500" : "#CBD5E0"}
            color="#1A202C"
            placeholderColor="#718096"
            labelColor="#4A5568"
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.email}
            </Text>
          )}
        </Box>

        {/* Company Name — shown only for managers */}
        {!isEmployee && (
          <Box mb={4}>
            <InputField
              label="Company name"
              placeholder="Your company"
              value={formData.companyName}
              onChange={handleChange("companyName")}
              bg="white"
              borderColor={errors.companyName ? "red.500" : "#CBD5E0"}
              color="#1A202C"
              placeholderColor="#718096"
              labelColor="#4A5568"
              disabled={isLoading}
              autoComplete="organization"
            />
            {errors.companyName && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.companyName}
              </Text>
            )}
          </Box>
        )}

        {/* Password */}
        <Box mb={6}>
          <PasswordField
            label="Password"
            placeholder="••••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            required
            bg="white"
            borderColor={errors.password ? "red.500" : "#CBD5E0"}
            color="#1A202C"
            placeholderColor="#718096"
            labelColor="#4A5568"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.password && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.password}
            </Text>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          w="100%"
          bg="#162837"
          color="white"
          py={6}
          mb={4}
          borderRadius="md"
          fontWeight="medium"
          fontSize="sm"
          type="submit"
          loading={isLoading}
          loadingText="Creating account..."
        >
          Sign Up
        </Button>
      </form>

      {/* Login Redirect */}
      <Text fontSize="13px" color="#718096" textAlign="center">
        Already have an account?{" "}
        <Text
          as="span"
          color="#162837"
          fontWeight="500"
          cursor="pointer"
          onClick={onLogin}
          _hover={{ textDecoration: "underline" }}
        >
          Log in
        </Text>
      </Text>
    </Box>
  );
}
