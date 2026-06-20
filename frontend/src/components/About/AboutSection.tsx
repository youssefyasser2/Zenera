"use client";

import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";

const HeroSectionPage = () => {
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
        maxW="1100px"
        mx="auto"
        direction={{ base: "column", md: "row" }}
        align="center"
        gap={{ base: 10, md: 20 }}
      >
        {/* ✅ Left Side - Image */}
        <Box flex="1" textAlign="center">
          <Image
            src="./src/assets/images/my-photo.png"
            alt="My photo"
            borderRadius="full"
            boxSize={{ base: "180px", md: "250px" }}
            objectFit="cover"
            boxShadow="lg"
            mx="auto"
          />
        </Box>

        {/* ✅ Right Side - Text Content */}
        <Box flex="1">
          <Heading
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="bold"
            mb={4}
            color="#FFFFFF"
          >
            About Me 👋
          </Heading>

          <Text color="gray.300" fontSize="md" lineHeight="tall" mb={4}>
            Hi, I'm Youssef — a passionate <strong>Full Stack Developer</strong> with
            experience in building responsive, user-friendly web applications.
          </Text>

          <Text color="gray.300" fontSize="md" lineHeight="tall">
            I love crafting clean interfaces and efficient backends using
            technologies like <strong>React, Next.js, and Laravel</strong>. I’m always
            excited to learn new tools and take on challenging projects that
            help people and businesses grow.
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default HeroSectionPage;
