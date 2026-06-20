"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Avatar,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import { Search, CheckCircle, Circle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "@/services/api";
import { useToast } from "@chakra-ui/toast";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  employeeId?: string;
}

const LinkEmployeePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await dashboardApi.getUsers();
      const allUsers: User[] = response.data.users
        .filter(
          (u: any) =>
            ["employee", "user"].includes(u.role?.toLowerCase()) &&
            (!u.companyId || u.companyId === null)
        )
        .map((u: any) => ({
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "No email",
          employeeId: u.employeeId || `#${u._id.slice(-6).toUpperCase()}`,
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${u._id}`,
          role: u.role,
        }));

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err: any) {
      const message = err.message || "Failed to load users";
      setError(message);
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setFilteredUsers(users);
        return;
      }

      try {
        const response = await dashboardApi.searchUnlinkedUsers(searchQuery);
        const searchedUsers = response.data.map((u: any) => ({
          _id: u._id,
          name: u.name || "Unknown",
          email: u.email || "No email",
          employeeId: u.employeeId || `#${u._id.slice(-6).toUpperCase()}`,
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${u._id}`,
          role: u.role,
        }));

        setFilteredUsers(searchedUsers);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleLink = async () => {
    if (!selectedUser) return;

    setIsLinking(true);
    try {
      await dashboardApi.linkEmployee(selectedUser);
      toast({
        title: "Success",
        description: "Employee linked successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/employee");
    } catch (err: any) {
      const message = err.message || "Failed to link employee";
      toast({
        title: "Link Failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      py={10}
      px={4}
    >
      <Box
        maxW="2xl"
        w="full"
        bg="#EBEBEB"
        borderRadius="2xl"
        boxShadow="2xl"
        overflow="hidden"
      >
        {/* Header */}
        <Box bg="#162837" color="#EBEBEB" px={8} py={6} textAlign="center">
          <Heading size="lg">Link Existing User</Heading>
          <Text fontSize="sm" opacity={0.8} mt={1}>
            Search by name, email, or employee ID
          </Text>
        </Box>

        <Box p={8}>
          {/* Search Input */}
          <Box position="relative" mb={6}>
            <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)">
              <Search size={20} color="#162837" />
            </Box>
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl="50px"
              py={6}
              bg="white"
              border="2px solid"
              borderColor="gray.300"
              borderRadius="xl"
              fontSize="md"
              _focus={{
                borderColor: "#162837",
                boxShadow: "0 0 0 1px #162837",
              }}
            />
          </Box>

          {error && (
            <Alert.Root status="error" borderRadius="lg" mb={4}>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          {/* Users List */}
          <Box
            maxH="420px"
            overflowY="auto"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            mb={6}
            bg="white"
          >
            {isLoading ? (
              <Flex justify="center" align="center" py={16}>
                <Spinner size="xl" color="#162837" />
              </Flex>
            ) : filteredUsers.length === 0 ? (
              <Box textAlign="center" py={12} color="gray.500">
                <Text fontSize="lg" fontWeight="medium">
                  No users found
                </Text>
                <Text fontSize="sm" mt={1}>
                  Try searching by name, email, or employee ID
                </Text>
              </Box>
            ) : (
              filteredUsers.map((user) => (
                <Flex
                  key={user._id}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  _last={{ borderBottom: "none" }}
                  cursor="pointer"
                  align="center"
                  bg={selectedUser === user._id ? "#DDE4E9" : "transparent"}
                  _hover={{
                    bg: selectedUser === user._id ? "#DDE4E9" : "gray.100",
                  }}
                  transition="0.2s"
                  onClick={() => setSelectedUser(user._id)}
                >
                  <Avatar.Root size="md" mr={4}>
                    <Avatar.Image src={user.avatar} alt={user.name} />
                    <Avatar.Fallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  <Box flex="1">
                    <Text fontWeight="semibold" color="#162837">
                      {user.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                    {user.employeeId && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        ID: {user.employeeId}
                      </Text>
                    )}
                  </Box>

                  {selectedUser === user._id ? (
                    <CheckCircle size={26} color="#162837" fill="#162837" />
                  ) : (
                    <Circle size={26} color="#A0AEC0" />
                  )}
                </Flex>
              ))
            )}
          </Box>

          {/* Action Buttons */}
          <Flex gap={4}>
            <Button
              onClick={() => navigate(-1)}
              flex="1"
              size="lg"
              variant="outline"
              borderColor="#162837"
              color="#162837"
              _hover={{ bg: "#162837", color: "#EBEBEB" }}
              disabled={isLinking}
            >
              Back
            </Button>
            <Button
              flex="1"
              size="lg"
              bg="#162837"
              color="#EBEBEB"
              _hover={{ bg: "#0f1e2a" }}
              onClick={handleLink}
              loading={isLinking}
              disabled={!selectedUser || isLinking}
            >
              Link User
            </Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};

export default LinkEmployeePage;
