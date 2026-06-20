import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";

const ProgressCardPage = () => {
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
        maxW="1300px"
        mx="auto"
        align="center"
        justify="space-between"
        direction={{ base: "column", lg: "row" }}
        gap={{ base: 10, lg: 20 }}
        w="100%"
      >
        {/* Left Side - Image */}
        <Box
          flex="1.2"
          borderRadius="2xl"
          overflow="hidden"
          transition="transform 0.3s ease"
          _hover={{ transform: "scale(1.03)" }}
        >
          <img
            src="./src/assets/images/Chart.png"
            alt="Analytics Chart"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "1rem",
            }}
          />
        </Box>

        {/* Right Side - Content */}
        <Box flex="1" color="white" textAlign={{ base: "center", lg: "left" }}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            mb={3}
            textTransform="uppercase"
            letterSpacing="widest"
          >
            WHY CHOOSE US
          </Text>

          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            mb={6}
            lineHeight="1.2"
          >
            Track real-time shifts <br /> with advanced analytics
          </Heading>

          <Text
            color="gray.400"
            mb={10}
            lineHeight="tall"
            maxW="480px"
            mx={{ base: "auto", lg: "0" }}
          >
           Monitor, analyze, and optimize your team’s performance in real time with our intuitive dashboard. Make better staffing decisions with clear insights.
          </Text>

          {/* Feature List */}
          <Flex
            direction="column"
            gap={4}
            mb={10}
            align={{ base: "center", lg: "flex-start" }}
          >
            {["Smart Shift Analytics", "Team Management", "24/7 Assistance"].map(
              (feature, i) => (
                <Flex align="center" gap={3} key={i}>
                  <Flex
                    align="center"
                    justify="center"
                    bg="rgba(255,255,255,0.15)"
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    flexShrink={0}
                  >
                    <Text fontWeight="bold" fontSize="sm">
                      {i + 1}
                    </Text>
                  </Flex>
                  <Text fontSize="md" color="gray.200">
                    {feature}
                  </Text>
                </Flex>
              )
            )}
          </Flex>

            <Button
            size="lg"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="600"
            fontSize="18px"
            px="10"
            py="6"
            borderRadius="md"
            bg="white"
            color="#162837"
            mx="auto"
            boxShadow="0px 6px 18px rgba(0, 0, 0, 0.15)"
            _hover={{
                bg: "gray.100",
                transform: "translateY(-3px)",
                boxShadow: "0px 8px 22px rgba(255, 255, 255, 0.25)",
            }}
            _active={{
                transform: "translateY(0)",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            }}
            transition="all 0.3s ease"
            onClick={() => (window.location.href = "/register")}
            >
            Learn More
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default ProgressCardPage;
