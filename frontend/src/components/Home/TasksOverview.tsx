import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";

const TasksOverviewPage = () => {
  return (
    <Box
      bg="#EBEBEB"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 10, md: 16 }}
      px={{ base: 6, md: 10 }}
    >
      <Flex
        maxW="1300px"
        w="100%"
        mx="auto"
        gap={{ base: 12, lg: 24 }}
        align="center"
        justify="center"
        direction={{ base: "column", lg: "row" }}
        textAlign={{ base: "center", lg: "left" }}
      >
        {/* Left Side */}
        <Box flex="1" maxW="540px">
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="bold"
            mb={6}
            lineHeight="1.2"
            color="gray.900"
          >
            Never miss any task
          </Heading>

          <Text color="gray.600" mb={8} lineHeight="tall">
            Simplify your workflow with smart task management. Create, track,
            and complete tasks faster with real-time progress updates. Boost
            your team's productivity.
          </Text>

          <Button
            bg="#162837"
            color="white"
            px={10}
            py={6}
            borderRadius="md"
            _hover={{ bg: "gray.800" }}
            fontWeight="medium"
            boxShadow="0 8px 20px rgba(0,0,0,0.15)"
            onClick={() => (window.location.href = "/register")}
          >
            Add First Task
          </Button>
        </Box>

        {/* Right Side - Larger Image */}
        <Box flex="1" maxW={{ base: "100%", lg: "750px" }}>
          <Image
            src="./src/assets/images/taskes.png"
            alt="Tasks overview"
            borderRadius="lg"
            w="100%"
            h="auto"
            objectFit="cover"
            display="block"
            transition="transform 0.4s ease"
            _hover={{ transform: "scale(1.05)" }}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default TasksOverviewPage;
