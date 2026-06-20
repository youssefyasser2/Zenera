"use client";

import { Box, Button, Flex, Heading, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import  { useState } from "react";
import * as React from "react";


const ContactSectionPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Message sent successfully!");
  };

  return (
    <Box
      bg="#162837"
      minH="100vh"
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 12 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        maxW="700px"
        mx="auto"
        direction="column"
        align="center"
        bg="white"
        p={{ base: 8, md: 12 }}
        borderRadius="lg"
        boxShadow="lg"
        w="100%"
      >
        <Heading
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="bold"
          mb={4}
          color="#1A202C"
          textAlign="center"
        >
          Get in Touch 📩
        </Heading>

        <Text color="gray.600" fontSize="md" textAlign="center" mb={8}>
          Have a question, proposal, or just want to say hi? I’d love to hear from you.
        </Text>

        {/* ✅ Contact Form */}
        <VStack gap={5} w="100%">
          <Input
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange("name")}
            bg="#F9FAFB"
            borderColor="gray.300"
            borderRadius="full"
            py={5}
            px={4}
            _placeholder={{ color: "gray.500" }}
          />

          <Input
            placeholder="Your Email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            bg="#F9FAFB"
            borderColor="gray.300"
            borderRadius="full"
            py={5}
            px={4}
            _placeholder={{ color: "gray.500" }}
          />

          <Textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange("message")}
            bg="#F9FAFB"
            borderColor="gray.300"
            borderRadius="lg"
            py={4}
            px={4}
            rows={5}
            _placeholder={{ color: "gray.500" }}
          />

          <Button
            w="50%"
            bg="#1e2d3d"
            color="white"
            py={6}
            borderRadius="full"
            _hover={{ bg: "#2a3d4f" }}
            fontWeight="medium"
            fontSize="md"
            onClick={handleSubmit}
          >
            Send Message
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ContactSectionPage;
