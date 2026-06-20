"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { Check } from "lucide-react"; 

const plans = [
  {
    title: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started and testing features.",
    features: ["1 Project", "Basic Analytics", "Community Support"],
    buttonText: "Start Free",
    highlighted: false,
  },
  {
    title: "Pro",
    price: "$19",
    period: "/month",
    description: "Ideal for professionals who need more flexibility.",
    features: ["10 Projects", "Advanced Analytics", "Priority Support"],
    buttonText: "Go Pro",
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: "Custom",
    period: "",
    description: "Best for teams and organizations with custom needs.",
    features: [
      "Unlimited Projects",
      "Dedicated Account Manager",
      "Custom Integrations",
    ],
    buttonText: "Contact Sales",
    highlighted: false,
  },
];

const PricingSectionPage = () => {
  return (
    <Box
      bg="#F7F7F7"
      minH="100vh"
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 12 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box maxW="1100px" mx="auto" w="100%">
        <VStack gap={4} mb={12} textAlign="center">
          <Heading fontSize={{ base: "3xl", md: "4xl" }} color="#1A202C">
            Choose Your Plan
          </Heading>
          <Text color="gray.600" fontSize="md" maxW="600px">
            Select the plan that best fits your needs and scale as you grow.
          </Text>
        </VStack>

        {/* Pricing Cards */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="center"
          gap={8}
        >
          {plans.map((plan) => (
            <Box
              key={plan.title}
              bg={plan.highlighted ? "#1e2d3d" : "white"}
              color={plan.highlighted ? "white" : "gray.800"}
              borderRadius="2xl"
              boxShadow="md"
              p={8}
              flex="1"
              maxW="340px"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "xl",
              }}
              position="relative"
              overflow="hidden"
            >
              {/* Highlight Badge */}
              {plan.highlighted && (
                <Box
                  position="absolute"
                  top="-1"
                  right="-1"
                  bg="yellow.400"
                  color="gray.900"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="bold"
                  borderBottomLeftRadius="md"
                >
                  POPULAR
                </Box>
              )}

              <VStack gap={3} align="start">
                <Heading fontSize="2xl" fontWeight="bold">
                  {plan.title}
                </Heading>

                <HStack align="baseline">
                  <Text fontSize="4xl" fontWeight="extrabold">
                    {plan.price}
                  </Text>
                  {plan.period && (
                    <Text fontSize="md" color="gray.400">
                      {plan.period}
                    </Text>
                  )}
                </HStack>

                <Text
                  fontSize="sm"
                  color={plan.highlighted ? "gray.300" : "gray.600"}
                  mb={3}
                >
                  {plan.description}
                </Text>

                <Box h="1px" w="full" bg={plan.highlighted ? "gray.600" : "gray.200"} />

                {/* Features */}
                <VStack align="start" gap={2} mt={4} w="full">
                  {plan.features.map((feature, idx) => (
                    <HStack key={idx} gap={2} align="center">
                      <Check
                        size={16}
                        color={plan.highlighted ? "#9AE6B4" : "#48BB78"}
                        strokeWidth={3}
                      />
                      <Text fontSize="sm" color="inherit">
                        {feature}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                {/* CTA Button */}
                <Button
                  w="full"
                  mt={6}
                  bg={plan.highlighted ? "white" : "#1e2d3d"}
                  color={plan.highlighted ? "#1e2d3d" : "white"}
                  _hover={{
                    bg: plan.highlighted ? "gray.100" : "#2a3d4f",
                  }}
                  borderRadius="full"
                  fontWeight="medium"
                  fontSize="sm"
                  boxShadow="sm"
                >
                  {plan.buttonText}
                </Button>
              </VStack>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default PricingSectionPage;