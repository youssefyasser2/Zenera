import {
  Flex,
  Box,
  Text,
  Button,
  HStack,
  useBreakpointValue,
  Image,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

const isActive = (path: string, currentPath: string): boolean => {
  if (path === "/") return currentPath === "/";
  return currentPath.startsWith(path);
};

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const buttonSize = useBreakpointValue<"xs" | "sm">({
    base: "xs",
    md: "sm",
  });

  return (
    <Box
      w="100%"
      bg="#162837"
      zIndex="10"
      position="relative"
      py={{ base: 2, md: 3 }}
    >
      <Flex
        as="nav"
        color="white"
        align="center"
        justify="space-between"
        px={{ base: "6", sm: "10", md: "16", lg: "24" }}
        py={{ base: "3", md: "4" }}
        w="100%"
      >
        {/* Navigation Links */}
        <HStack
          gap={{ base: 3, md: 5, lg: 6 }}
          display={{ base: "none", md: "flex" }}
        >
          {[
            { label: "Home", path: "/" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
            { label: "Pricing", path: "/pricing" },
          ].map(({ label, path }) => {
            const active = isActive(path, currentPath);
            return (
              <Link key={path} to={path} style={{ textDecoration: "none" }}>
                <Text
                  position="relative"
                  cursor="pointer"
                  fontSize="sm"
                  fontWeight="medium"
                  color={active ? "gray.200" : "white"}
                  pb="1"
                  transition="all 0.3s ease"
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "2px",
                    bg: "gray.400",
                    transformOrigin: "left",
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 0.5s ease",
                  }}
                  _hover={{
                    color: "gray.400",
                    _after: {
                      transform: "scaleX(0)",
                    },
                  }}
                >
                  {label}
                </Text>
              </Link>
            );
          })}
        </HStack>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <Image
            src="./src/assets/icons/logo.svg"
            alt="Zenera Logo"
            cursor="pointer"
            boxSize={{ base: "140px", md: "180px", lg: "250px" }} // bigger logo
            objectFit="contain"
            maxH="60px" 
            ml={{ base: "-4", md: "-6", lg: "-8" }}
          />
        </Link>

        {/* Buttons */}
        <HStack gap={{ base: 2, md: 3 }}>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button
              variant="outline"
              borderColor="whiteAlpha.500"
              color="white"
              size={buttonSize}
              _hover={{ bg: "whiteAlpha.100" }}
              display={{ base: "none", sm: "inline-flex" }}
            >
              Sign in
            </Button>
          </Link>
          <Link to="/role-selector" style={{ textDecoration: "none" }}>
            <Button
              colorScheme="gray"
              size={buttonSize}
              _hover={{ bg: "gray.600" }}
            >
              Create Account
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
