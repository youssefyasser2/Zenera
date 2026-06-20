"use client";

import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import InputField from "../ui/Fields/InputField";
import PasswordField from "../ui/Fields/PasswordField";

import type { RootState } from "@/store";
import { loginThunk } from "@/services/auth/auth.thunk";
import type { AppDispatch } from "@/store";

interface LoginFormProps {
  onSignUp: () => void;
}

export default function LoginForm({ onSignUp }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.auth);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const result = await dispatch(loginThunk(formData)).unwrap();
    console.log("🔍 Login Result:", result); 

    const userRole = result.user.role; 
    if (userRole === "manager" ) {
      navigate("/dashboard", { replace: true });
    } else if (userRole === "employee") {
      navigate("/employee-page", { replace: true });
    }
  } catch (err) {
    console.error(err);
  }
};


  return (
    <Box maxW="480px" w="100%">
      <Heading fontSize="5xl" fontWeight="bold" mb={4} color="white">
        Welcome back
      </Heading>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Email address"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
          disabled={isLoading}
        />

        <Box mb={6}>
          <PasswordField
            label="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
            disabled={isLoading}
          />
        </Box>

        <Button
          type="submit"
          w="100%"
          bg="#EBEBEB"
          color="#162837"
          py={6}
          borderRadius="md"
          fontWeight="medium"
          fontSize="md"
          loading={isLoading}
          loadingText="Logging in..."
        >
          Login
        </Button>
      </form>

      <Text fontSize="sm" color="gray.400" textAlign="center" mt={4}>
        Don't have an account?{" "}
        <Text
          as="span"
          color="white"
          fontWeight="medium"
          cursor="pointer"
          onClick={onSignUp}
        >
          Create free account
        </Text>
      </Text>
    </Box>
  );
}
