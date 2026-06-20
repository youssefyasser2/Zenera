// src/pages/LoginSectionPage.tsx
"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { memo } from "react";
import LoginForm from "./LoginForm";

const LoginSectionPage = memo(() => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <Box
      bg="#162837"
      minH="100vh"
      py={{ base: 12, md: 20 }}
      px={{ base: 6, md: 10 }}
      display="flex"
      alignItems="center"
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
          display={{ base: "none", lg: "block" }}
        >
          <img
            src="/src/assets/images/login-image.png"
            alt="Woman working on laptop"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "1rem",
            }}
          />
        </Box>

        {/* Right Side - Login Form */}
        <LoginForm onSignUp={handleSignUp} />
      </Flex>
    </Box>
  );
});

LoginSectionPage.displayName = "LoginSectionPage";
export default LoginSectionPage;