"use client";

import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      bgGradient="linear(to-br, #0F1C26, #223A4E)"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 6, md: 10 }}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        bg="white"
        borderRadius="2xl"
        p={{ base: 10, md: 14 }}
        boxShadow="0 12px 30px rgba(0,0,0,0.2)"
        maxW="520px"
        w="100%"
        transition="transform 0.3s ease, box-shadow 0.3s ease"
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
        }}
      >
        <Heading
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="#162837"
          mb={4}
        >
          Choose Your Role
        </Heading>

        <Text color="gray.600" mb={10} fontSize="15px" lineHeight="1.7">
          Please select whether you’re registering as a{" "}
          <b>Manager</b> or an <b>Employee</b> to continue.
        </Text>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={6}
          w="100%"
          justify="center"
        >
          <Button
            flex="1"
            bg="#162837"
            color="white"
            py={6}
            fontWeight="500"
            fontSize="16px"
            borderRadius="lg"
            _hover={{
              bg: "#1f384a",
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(22,40,55,0.4)",
            }}
            transition="all 0.2s ease"
            onClick={() => navigate("/manager/register")}
          >
             I’m a Manager
          </Button>

          <Button
            flex="1"
            bg="white"
            color="#162837"
            border="2px solid #162837"
            py={6}
            fontWeight="500"
            fontSize="16px"
            borderRadius="lg"
            _hover={{
              bg: "#f7f7f7",
              transform: "scale(1.05)",
              boxShadow: "0 4px 12px rgba(22,40,55,0.15)",
            }}
            transition="all 0.2s ease"
            onClick={() => navigate("/employee/register")}
          >
            I’m an Employee
          </Button>
        </Flex>

        <Text
          color="gray.500"
          fontSize="13px"
          mt={10}
          fontStyle="italic"
          lineHeight="1.6"
        >
          Your role determines the tools and dashboard you’ll access.
        </Text>
      </Flex>
    </Box>
  );
};

export default RoleSelectionPage;
