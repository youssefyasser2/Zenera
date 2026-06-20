import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";

const HeroSectionPage = () => {
  return (
    <Box
      bg="#162837"
      color="white"
      h={{ base: "120vh", md: "115vh", lg: "88vh" }}
      py={{ base: 10, md: 30, lg: 40 }}
      px={{ base: 5, md: 10, lg: 20 }}
    >
      <Flex
        maxW="1400px" 
        mx="auto"
        align="center"
        justify="space-between"
        gap={{ base: 10, lg: 40 }} 
        direction={{ base: "column", lg: "row" }}
        textAlign={{ base: "center", lg: "left" }}
      >
        {/* Left Content */}
        <Box flex="1" maxW={{ base: "90%", lg: "500px" }}>
          <Heading
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            lineHeight="1.2"
            mb={6}
          >
            Keep your team in perfect sync
          </Heading>

          {/* Avatar Group with Text */}
          <Flex justify={{ base: "center", lg: "flex-start" }}>
            {[1, 2, 3, 4].map((num, index) => (
              <Avatar.Root
                key={num}
                boxSize="9"
                border="2px solid white"
                shadow="md"
                ml={index === 0 ? 0 : "-3"}
                zIndex={4 - index}
              >
                <Avatar.Image src={`https://i.pravatar.cc/150?img=${num}`} />
                <Avatar.Fallback>{num}</Avatar.Fallback>
              </Avatar.Root>
            ))}
          </Flex>

          <Flex
            mt={4}
            align="center"
            gap={2}
            justify={{ base: "center", lg: "flex-start" }}
          >
            <Box>
              <Text
                fontWeight="medium"
                fontSize="sm"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                Join over <strong>4,600+</strong> managers and start receiving
              </Text>
              <Text
                fontWeight="medium"
                fontSize="sm"
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                feedback right now.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Right Image */}
        <Box flex="1" maxW={{ base: "90%", lg: "600px" }}>
          <Box borderRadius="lg" boxShadow="xl" overflow="hidden">
            <img
              src="/src/assets/images/hero-image.png"
              alt="Developer reviewing code analytics"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        </Box>
      </Flex>

      {/* Centered Button at the Bottom */}
 <Flex justify="center" mt={{ base: "10rem", md: "6rem" }} w="98%">
      <Button
        size="lg"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="600"
        fontSize="18px"
        px="10"
        py="7"
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
        onClick={() => window.location.href="login"}
      >
        Get Started
      </Button>
    </Flex> 
    </Box>
  );
};

export default HeroSectionPage;
