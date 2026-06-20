"use client";

import { Box, Flex, Text, Button, Icon } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { memo } from "react";
import { dashboardApi } from "@/services/api";
import {
  LayoutGrid,
  CalendarClock,
  Users2,
  LifeBuoy,
  UserCog,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
}

const Sidebar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "Shifts", path: "/shifts", icon: CalendarClock },
    { label: "Employee", path: "/employee", icon: Users2 },
    { label: "Support", path: "/support", icon: LifeBuoy },
    { label: "Profile", path: "/profile", icon: UserCog },
  ];

  const handleLogout = async () => {
    try {
      await dashboardApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  return (
    <Box
      w="250px"
      bg="#FFFFFF"
      color="#1A202C"
      display={{ base: "none", lg: "flex" }}
      flexDirection="column"
      position="sticky"
      top={0}
      h="100vh"
      borderRight="1px solid"
      borderColor="gray.200"
    >
      {/* Logo */}
      <Box
        p={5}
        borderBottom="1px solid"
        borderColor="gray.200"
        textAlign="center"
      >
        <Text fontSize="2xl" fontWeight="extrabold" color="#162837" letterSpacing="wide">
          ZENERA
        </Text>
      </Box>

      {/* Navigation */}
      <Flex direction="column" flex="1" p={4} gap={1}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;

          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              justifyContent="flex-start"
              variant="ghost"
              bg={isActive ? "#E8F0FE" : "transparent"}
              color={isActive ? "#162837" : "#4A5568"}
              _hover={{
                bg: "#EDF2F7",
                color: "#162837",
                transform: "translateX(4px)",
              }}
              fontWeight={isActive ? "600" : "normal"}
              fontSize="sm"
              px={4}
              py={3}
              borderRadius="lg"
              display="flex"
              alignItems="center"
              gap={3}
              transition="all 0.2s"
            >
              <Icon as={IconComponent} boxSize={5} />
              {item.label}
            </Button>
          );
        })}
      </Flex>

      {/* Logout */}
      <Box p={4} borderTop="1px solid" borderColor="gray.200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          color="#E53E3E"
          _hover={{
            bg: "rgba(229, 62, 62, 0.08)",
            color: "#C53030",
          }}
          justifyContent="flex-start"
          w="100%"
          fontSize="sm"
          px={4}
          py={3}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          gap={3}
          transition="all 0.2s"
        >
          <Icon as={LogOut} boxSize={5} />
          Logout
        </Button>
      </Box>
    </Box>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
