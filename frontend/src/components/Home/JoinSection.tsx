"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import InputField from "@/components/ui/Fields/InputField";
import { useState } from "react";

const JoinSectionPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    alert("Account created successfully!");
  };

  return (
    <Box
      bg="#EBEBEB"
      minH="100vh"
      py={{ base: 12, md: 20 }}
      px={{ base: 6, md: 10 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
     onClick={() => (window.location.href = "/register")}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        align="center"
        justify="space-between"
        direction={{ base: "column", lg: "row" }}
        gap={{ base: 10, lg: 16 }}
        w="100%"
      >
        {/* Left Side - Image */}
        <Box
          flex="1"
          borderRadius="2xl"
          overflow="hidden"
          maxW={{ base: "100%", lg: "450px" }}
          boxShadow="lg"
        >
          <img
            src="./src/assets/images/join.png"
            alt="Two women smiling and chatting"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "1rem",
            }}
          />
        </Box>

        {/* Right Side - Form */}
        <Box flex="1" maxW={{ base: "100%", lg: "500px" }} w="100%">
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "48px" }}
            fontWeight="bold"
            mb={3}
            lineHeight="1.2"
            color="#1A202C"
          >
            Join us today 👋
          </Heading>

          <Text color="#4A5568" mb={8} lineHeight="1.6" fontSize="14px">
            Zenera gives you the tools to manage shifts, employees, and performance with ease.
          </Text>

          {/* Sign Up with Google */}
          <Button
            w="100%"
            bg="#2C3E50"
            color="white"
            py={6}
            mb={6}
            borderRadius="full"
            _hover={{ bg: "#34495e" }}
            fontWeight="500"
            fontSize="15px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={3}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
                fill="#4285F4"
              />
              <path
                d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>

          {/* Form Fields */}
          <VStack gap={4} align="stretch" w="100%">
            <InputField
              label="First & Last Name"
              placeholder="i.e. Davon Lean"
              value={formData.name}
              onChange={handleChange("name")}
              bg="white"
              borderColor="#CBD5E0"
              color="#1A202C"
              placeholderColor="#718096"
              labelColor="#4A5568"
            />

            <InputField
              label="Email Address"
              placeholder="i.e. davon@mail.com"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              bg="white"
              borderColor="#CBD5E0"
              color="#1A202C"
              placeholderColor="#718096"
              labelColor="#4A5568"
            />

            <InputField
              label="Password"
              placeholder="••••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              bg="white"
              borderColor="#CBD5E0"
              color="#1A202C"
              placeholderColor="#718096"
              labelColor="#4A5568"
            />

            {/* Remember Me */}
            <Box pt={1}>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="13px" color="#4A5568">
                    Remember me
                  </Text>
                </Checkbox.Label>
              </Checkbox.Root>
            </Box>
          </VStack>

          {/* Submit Button */}
          <Button
            w="50%"
            bg="#2C3E50"
            color="white"
            py={6}
            mt={6}
            borderRadius="full"
            _hover={{ bg: "#34495e" }}
            fontWeight="500"
            fontSize="15px"
            mx="auto"
            onClick={handleSubmit}
          >
            Create Account
          </Button>

          {/* Sign In link */}
          <Text fontSize="13px" color="#718096" textAlign="center" mt={4}>
            Don't have an account?{" "}
            <Text as="span" color="#3182CE" fontWeight="500" cursor="pointer">
              Create free account
            </Text>
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default JoinSectionPage;
