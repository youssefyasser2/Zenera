"use client";

import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  Stack,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useToast } from "@chakra-ui/toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";

export default function NewEmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password } = formData;
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await dashboardApi.createEmployee(formData);

      toast({
        title: "Success",
        description: "Employee created successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create employee",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#F7F9FC" p={8}>
      <Box
        maxW="800px"
        mx="auto"
        bg="#162837"
        borderRadius="xl"
        boxShadow="md"
        p={8}
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb={6}
          textAlign="center"
          color="gray.100"
        >
          Create New Employee
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            {/* Name */}
            <FormControl isRequired>
              <FormLabel color="gray.100">Employee Name</FormLabel>
              <Input
                name="name"
                bg="white"
                color="#1A202C"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ahmed Mohamed"
              />
            </FormControl>

            {/* Email */}
            <FormControl isRequired>
              <FormLabel color="gray.100">Email</FormLabel>
              <Input
                name="email"
                type="email"
                bg="white"
                color="#1A202C"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </FormControl>

            {/* Password */}
            <FormControl isRequired>
              <FormLabel color="gray.100">Password</FormLabel>
              <Input
                name="password"
                type="password"
                bg="white"
                color="#1A202C"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </FormControl>

            {/* Buttons */}
            <Flex justify="flex-end" gap={3} mt={6}>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                loading={isLoading}
                loadingText="Creating..."
              >
                Create Employee
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
