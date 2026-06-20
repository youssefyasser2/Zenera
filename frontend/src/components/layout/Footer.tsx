import { Box, Flex, Text, Link, Button, Heading, Icon } from "@chakra-ui/react";
import { FaFacebookF, FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";

const FooterPage = () => {
  return (
    <Box bg="#162837" color="white" py={16}>
      <Box w="100%" maxW="1400px" mx="auto" px={{ base: 6, md: 6, lg: 1 }}>
        {/* Top Section */}
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          mb={12}
          pb={12}
          borderBottom="2px solid rgba(255, 255, 255, 0.61)"
          gap={{ base: 6, md: 0 }}
        >
          <Box>
            <Heading size="lg" mb={2}>
              Learn how to grow your audience <Text as="span">💪</Text>
            </Heading>
            <Text fontSize="lg">Manage employees and shifts effortlessly</Text>
          </Box>
          <Button
            bg="white"
            color="black"
            px={6}
            py={3}
            borderRadius="full"
            _hover={{ bg: "gray.100" }}
            fontWeight="medium"
          >
            Download Now
          </Button>
        </Flex>

        {/* Links Section */}
        <Flex justify="space-between" gap={12} flexWrap="wrap" mb={12}>
          <Box flex="2" minW="250px" maxW="400px">
            <Heading size="sm" mb={4}>
              About Zenera
            </Heading>
            <Text fontSize="sm" color="gray.400" lineHeight="tall">
              Zenera helps managers and teams stay organized, track attendance,
              and manage shifts with ease. Empower your workplace with smarter
              tools for better collaboration and productivity.
            </Text>
          </Box>

          {["Company", "Help", "Resources"].map((section) => (
            <Box key={section} flex="1" minW="180px">
              <Heading size="sm" mb={4}>
                {section}
              </Heading>
              <Flex direction="column" gap={3}>
                {section === "Company" &&
                  ["About Us", "Features", "Our Work", "Careers"].map(
                    (link) => (
                      <Link
                        key={link}
                        href="#"
                        color="gray.300"
                        fontSize="sm"
                        _hover={{ color: "white" }}
                      >
                        {link}
                      </Link>
                    )
                  )}
                {section === "Help" &&
                  [
                    "Customer Support",
                    "Delivery Details",
                    "Terms & Conditions",
                    "Privacy Policy",
                  ].map((link) => (
                    <Link
                      key={link}
                      href="#"
                      color="gray.300"
                      fontSize="sm"
                      _hover={{ color: "white" }}
                    >
                      {link}
                    </Link>
                  ))}
                {section === "Resources" &&
                  [
                    "Free eBooks",
                    "Developer Tutorials",
                    "How-To Blog",
                    "YouTube Playlist",
                  ].map((link) => (
                    <Link
                      key={link}
                      href="#"
                      color="gray.300"
                      fontSize="sm"
                      _hover={{ color: "white" }}
                    >
                      {link}
                    </Link>
                  ))}
              </Flex>
            </Box>
          ))}
        </Flex>

        {/* Social Icons */}
        <Flex gap={4}>
          <Link href="https://www.linkedin.com/in/youssef-yasser-y1/" _hover={{ opacity: 0.7 }}>
            <Icon as={FaLinkedin} boxSize={5} />
          </Link>
          <Link href="https://www.facebook.com/people/Youssef-Yasser/100010765205096/" _hover={{ opacity: 0.7 }}>
            <Icon as={FaFacebookF} boxSize={5} />
          </Link>
          <Link href="https://www.instagram.com/you8sef_198/" _hover={{ opacity: 0.7 }}>
            <Icon as={FaInstagram} boxSize={5} />
          </Link>
          <Link href="https://github.com/youssefyasser2" _hover={{ opacity: 0.7 }}>
            <Icon as={FaGithub} boxSize={5} />
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

export default FooterPage;
