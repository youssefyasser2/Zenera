"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Icon,
  Spinner,
} from "@chakra-ui/react";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";

const NotFoundPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await dashboardApi.getMe();
        setUserRole(res.data?.user?.role ?? null);
      } catch (error) {
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleRedirect = () => {
    if (userRole === "manager") {
      navigate("/dashboard", { replace: true });
    } else if (userRole === "employee") {
      navigate("/employee-page", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="#162837"
        color="white"
      >
        <Spinner size="xl" color="white" />
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="#162837"
      py={10}
      px={4}
      color="#EBEBEB"
    >
      <Container
        maxW="lg"
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        p={{ base: 8, md: 10 }}
        textAlign="center"
        transition="all 0.3s ease"
        _hover={{ boxShadow: "3xl", transform: "translateY(-4px)" }}
        color="#162837"
      >
        {/* Icon */}
        <Box
          display="inline-flex"
          bg="red.50"
          border="3px solid"
          borderColor="red.200"
          borderRadius="full"
          p={5}
          mb={6}
        >
          <Icon as={AlertCircle} boxSize={14} color="red.500" />
        </Box>

        {/* 404 Title */}
        <Heading
          fontSize={{ base: "6xl", md: "8xl" }}
          fontWeight="extrabold"
          color="#162837"
          mb={2}
          lineHeight="1"
        >
          404
        </Heading>

        <Heading as="h2" size="xl" color="#2D3748" fontWeight="semibold" mb={4}>
          Page Not Found
        </Heading>

        {/* Description */}
        <Text fontSize="lg" color="#4A5568" mb={8} lineHeight="1.6">
          The page you're looking for doesn’t exist or has been moved.
        </Text>

        {/* Action Button */}
        <VStack gap={4}>
          <Button
            onClick={handleRedirect}
            bg="#162837"
            color="white"
            size="lg"
            w="full"
            maxW="xs"
            fontWeight="medium"
            borderRadius="lg"
            _hover={{
              bg: "#0f1e2a",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
          >
            {userRole === "manager"
              ? "Go to Dashboard"
              : userRole === "employee"
              ? "Go to Employee Page"
              : "Back to Home"}
          </Button>
        </VStack>

        {/* Footer */}
        <Text fontSize="sm" color="#A0AEC0" mt={10}>
          If you think this is a mistake, please{" "}
          <Text
            as="span"
            color="#3182CE"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
          >
            contact support
          </Text>
          .
        </Text>
      </Container>
    </Flex>
  );
};

export default NotFoundPage;
