"use client";
import { Box, Flex, Avatar, Text, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { memo, useEffect, useState } from "react";
import { dashboardApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface UserData {
  name: string;
  avatar?: string;
  role: string;
}

const NAVBAR_BG = "#white"; 
const TEXT_COLOR = "#162837"; 
const BORDER_COLOR = "rgba(22, 40, 55, 0.15)";
const HOVER_BG = "rgba(22, 40, 55, 0.05)";
const ACTIVE_BG = "rgba(22, 40, 55, 0.08)";

const Navbar = memo(() => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await dashboardApi.getMe();
        const user = response.data.user || response.data;

        setUserData({
          name: user.name || "User",
          avatar: user.avatar || `https://i.pravatar.cc/150?u=${user._id}`,
          role: user.role || "Employee",
        });
      } catch (error) {
        console.error("Failed to load user data for navbar:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // 🌀 Loading Skeleton
  if (loading) {
    return (
      <Box
        bg={NAVBAR_BG}
        borderBottom="1px solid"
        borderColor={BORDER_COLOR}
        px={8}
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex justify="flex-end" align="center" gap={3}>
          <SkeletonCircle size="10" />
          <SkeletonText noOfLines={1} width="100px" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      bg={NAVBAR_BG}
      borderBottom="1px solid"
      borderColor={BORDER_COLOR}
      px={{ base: 4, md: 8 }}
      py={2.5}
      position="sticky"
      top={0}
      zIndex={10}
      width="100%"
    >
      <Flex justify="flex-end" align="center" maxW="100%" mx="auto">
        {/* User card */}
        <Flex
          align="center"
          gap={3}
          px={3.5}
          py={2}
          borderRadius="xl"
          cursor="pointer"
          transition="all 0.2s ease-in-out"
          _hover={{ bg: HOVER_BG }}
          _active={{ bg: ACTIVE_BG }}
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/dashboard");
          }}
        >
           {/* Avatar */}
          <Avatar.Root size="md">
            <Avatar.Image src={userData?.avatar} alt={userData?.name} />
            <Avatar.Fallback bg={TEXT_COLOR} color="white">
              {userData?.name?.[0]?.toUpperCase() || "A"}
            </Avatar.Fallback>
          </Avatar.Root>

          {/* Name & Role */}
          <Box textAlign="left" display={{ base: "none", md: "block" }}>
            <Text fontSize="sm" fontWeight="600" color={TEXT_COLOR}>
              {userData?.name || "User"}
            </Text>
            <Text fontSize="xs" color={TEXT_COLOR} opacity={0.65}>
              {userData?.role || "Employee"}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
