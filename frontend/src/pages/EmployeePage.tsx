// src/pages/PageEmployee.tsx
"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Spinner,
  Badge,
  VStack,
  HStack,
  Icon,
  Grid,
  Container,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useToast } from "@chakra-ui/toast";
import { FiClock, FiCalendar, FiMapPin, FiMail, FiPhone, FiCheckCircle } from "react-icons/fi";

// === TYPES ===
interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

interface ApiUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string | GeoLocation;
  role: string;
  avatar?: string;
  bio?: string;
  createdAt?: string | number | Date;
}

interface Shift {
  _id: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

interface User {
  name: string;
  avatar?: string;
  role: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  joinDate?: string;
}

// === TYPE GUARD ===
const isGeoLocation = (loc: any): loc is GeoLocation => {
  return loc && typeof loc === "object" && "coordinates" in loc && Array.isArray(loc.coordinates);
};

// === COMPONENT ===
const PageEmployee = () => {
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Load User Profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await dashboardApi.getMe();
        const raw: ApiUser = res.data.user || res.data;

        let location: string = "Unknown";
        if (raw.location) {
          if (typeof raw.location === "string") {
            location = raw.location;
          } else if (isGeoLocation(raw.location)) {
            const [lng, lat] = raw.location.coordinates;
            location = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
        }

        const formatted: User = {
          name: raw.name || "Employee",
          avatar: raw.avatar || `https://i.pravatar.cc/150?u=${raw._id}`,
          role: raw.role || "Employee",
          email: raw.email,
          phone: raw.phone,
          location,
          bio: raw.bio || "No bio yet.",
          joinDate: raw.createdAt
            ? new Date(raw.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : undefined,
        };

        setUser(formatted);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load user data",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [toast]);

  // Load Employee Shifts
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const res = await dashboardApi.getMyShifts();
        const data: Shift[] = res.data?.shifts || [];
        setShifts(data);
      } catch (err: any) {
        toast({
          title: "Shifts Error",
          description: err.message || "Failed to load your shifts",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingShifts(false);
      }
    };

    loadShifts();
  }, [toast]);

  // Logout
  const handleLogout = async () => {
    try {
      await dashboardApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  // Helper: Format shift time
  const formatShiftDate = (start: string) => {
    const s = new Date(start);
    return s.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatShiftTime = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getStatusColor = (status: Shift["status"]) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "completed":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status: Shift["status"]) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return FiCheckCircle;
      case "pending":
        return FiClock;
      default:
        return FiCalendar;
    }
  };

  // Render Loading
  if (loadingUser) {
    return (
      <Flex minH="100vh" bg="gray.50" align="center" justify="center">
        <Spinner size="xl" color="#162837"  />
      </Flex>
    );
  }

  // Stats
  const confirmedShifts = shifts.filter(s => s.status === "confirmed").length;
  const pendingShifts = shifts.filter(s => s.status === "pending").length;
  const completedShifts = shifts.filter(s => s.status === "completed").length;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="#162837" borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="1200px">
          <Flex justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold" color="white">
              Zenera
            </Text>
            <Button
              size="sm"
              variant="ghost"
              // leftIcon={<Icon as={FiLogOut} />}
              onClick={handleLogout}
              color="gray.100"
              _hover={{ bg: "gray.100", color: "red.500" }}
            >
              Logout
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="1200px" py={8}>
        {/* Profile Section */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={8}
          mb={6}
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            gap={6}
          >
            <Avatar.Root size="2xl">
              <Avatar.Image src={user?.avatar} alt={user?.name} />
              <Avatar.Fallback bg="#162837" color="white">
                {user?.name?.[0]?.toUpperCase() ?? "E"}
              </Avatar.Fallback>
            </Avatar.Root>

            <Box flex="1" textAlign={{ base: "center", md: "left" }}>
              <Text fontSize="3xl" fontWeight="bold" color="#162837" mb={1}>
                {user?.name}
              </Text>
              <Badge colorScheme="blue" fontSize="sm" mb={4}>
                {user?.role}
              </Badge>

              <VStack align={{ base: "center", md: "flex-start" }} gap={2} mt={4}>
                {user?.email && (
                  <HStack color="gray.600">
                    <Icon as={FiMail} />
                    <Text fontSize="sm">{user.email}</Text>
                  </HStack>
                )}
                {user?.phone && (
                  <HStack color="gray.600">
                    <Icon as={FiPhone} />
                    <Text fontSize="sm">{user.phone}</Text>
                  </HStack>
                )}
                {user?.location && user.location !== "Unknown" && (
                  <HStack color="gray.600">
                    <Icon as={FiMapPin} />
                    <Text fontSize="sm">{user.location}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </Flex>
        </Box>

        {/* Stats Cards */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={4}
          mb={6}
        >
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <HStack mb={2}>
              <Box p={2} bg="green.50" borderRadius="lg">
                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Confirmed
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="#162837">
              {confirmedShifts}
            </Text>
          </Box>

          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <HStack mb={2}>
              <Box p={2} bg="orange.50" borderRadius="lg">
                <Icon as={FiClock} color="orange.500" boxSize={5} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Pending
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="#162837">
              {pendingShifts}
            </Text>
          </Box>

          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <HStack mb={2}>
              <Box p={2} bg="blue.50" borderRadius="lg">
                <Icon as={FiCalendar} color="blue.500" boxSize={5} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Completed
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="#162837">
              {completedShifts}
            </Text>
          </Box>
        </Grid>

        {/* Shifts Section */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={6}
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <HStack justify="space-between" mb={6}>
            <Text fontSize="xl" fontWeight="bold" color="#162837">
              Your Shifts
            </Text>
            <Badge colorScheme="gray" fontSize="sm">
              {shifts.length} Total
            </Badge>
          </HStack>

          {loadingShifts ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" color="#162837" />
            </Flex>
          ) : shifts.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Icon as={FiCalendar} boxSize={12} color="gray.300" mb={4} />
              <Text fontSize="lg" color="gray.500" fontWeight="medium" mb={1}>
                No shifts yet
              </Text>
              <Text fontSize="sm" color="gray.400">
                Your upcoming shifts will appear here
              </Text>
            </Box>
          ) : (
            <VStack gap={3} align="stretch">
              {shifts.map((shift) => (
                <Box
                  key={shift._id}
                  p={4}
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  bg="gray.50"
                  transition="all 0.2s"
                  _hover={{ bg: "gray.100", borderColor: "gray.300" }}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <HStack>
                      <Box
                        p={2}
                        bg={`${getStatusColor(shift.status)}.50`}
                        borderRadius="lg"
                      >
                        <Icon
                          as={getStatusIcon(shift.status)}
                          color={`${getStatusColor(shift.status)}.500`}
                          boxSize={5}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="md" fontWeight="semibold" color="#162837">
                          {formatShiftDate(shift.startTime)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatShiftTime(shift.startTime, shift.endTime)}
                        </Text>
                      </Box>
                    </HStack>
                    <Badge
                      colorScheme={getStatusColor(shift.status)}
                      fontSize="xs"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {shift.status}
                    </Badge>
                  </Flex>
                  {shift.notes && (
                    <Text fontSize="sm" color="gray.600" mt={2} pl={14}>
                      {shift.notes}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default PageEmployee;