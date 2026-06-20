"use client";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";

const RegisterSectionPage = memo(() => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Flex minH="100vh" direction={{ base: "column", lg: "row" }}>
      {/* Left Side - Dark Section with Testimonial */}
      <Box
        flex="1"
        bg="#162837"
        color="white"
        px={{ base: 8, md: 12, lg: 16 }}
        py={{ base: 12, md: 16, lg: 20 }}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          border="1px solid"
          borderColor="rgba(255,255,255,0.08)"
        />
        <Box
          position="absolute"
          bottom="-100px"
          right="-100px"
          w="300px"
          h="300px"
          borderRadius="full"
          border="1px solid"
          borderColor="rgba(255,255,255,0.08)"
        />

        <Box position="relative" zIndex={1} maxW="500px">
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "48px" }}
            fontWeight="bold"
            mb={6}
            lineHeight="1.2"
          >
            Welcome to our community
          </Heading>
          <Text color="rgba(255,255,255,0.7)" mb={12} lineHeight="tall" fontSize="15px">
            Clarity gives you the blocks & components you need to create a truly professional website.
          </Text>

          {/* Star Rating */}
          <Flex gap={1} mb={6}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#FFD700">
                <path d="M10 1L12.5 7.5H19L14 11.5L16.5 18L10 14L3.5 18L6 11.5L1 7.5H7.5L10 1Z" />
              </svg>
            ))}
          </Flex>

          {/* Testimonial */}
          <Text fontSize="16px" mb={8} lineHeight="1.7" fontStyle="italic" color="rgba(255,255,255,0.9)">
            "We love LandingFolio! Our designers were using it for their projects, so we already knew what kind of design they want."
          </Text>
        </Box>
      </Box>

      {/* Right Side - Registration Form */}
      <Box
        flex="1"
        bg="#EBEBEB"
        px={{ base: 8, md: 12, lg: 16 }}
        py={{ base: 12, md: 16, lg: 20 }}
        display="flex"
        alignItems="center"
      >
        <RegisterForm onLogin={handleLogin} />
      </Box>
    </Flex>
  );
});

RegisterSectionPage.displayName = "RegisterSectionPage";
export default RegisterSectionPage;