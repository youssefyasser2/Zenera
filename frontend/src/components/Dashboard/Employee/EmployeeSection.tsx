// src/pages/EmployeeSectionPage.tsx
"use client";

import {
  Box,
  Flex,
  Input,
  Text,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import {
  Search,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { toaster } from "@/components/ui/toaster";
import { dashboardApi } from "@/services/api";
import AddEmployeeDialog from "./AddEmployeeDialog";

// === TYPES ===
interface EmployeeSection {
  id: string;
  name: string;
  Id: string;
  age: number;
  department: string;
  location: string;
  mobileNumber: string;
  avatar?: string;
}

// Loading Skeleton
const EmployeeSectionSkeleton = memo(() => (
  <Box>
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} height="60px" mb={2} borderRadius="md" />
    ))}
  </Box>
));
EmployeeSectionSkeleton.displayName = "EmployeeSectionSkeleton";

const EmployeeSectionPage = () => {
  const [EmployeeSections, setEmployeeSections] = useState<EmployeeSection[]>([]);
  const [filteredEmployeeSections, setFilteredEmployeeSections] = useState<EmployeeSection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Load Employees
  const loadEmployeeSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await dashboardApi.getUsers();
      const EmployeeSectionsData: EmployeeSection[] = response.data.users.map((u: any) => {
        let locationStr = "Hadera 16, Tel Aviv";
        if (u.location) {
          if (typeof u.location === "string") {
            locationStr = u.location;
          } else if (
            "coordinates" in u.location &&
            Array.isArray(u.location.coordinates) &&
            u.location.coordinates.length === 2
          ) {
            const [lng, lat] = u.location.coordinates;
            locationStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
        }

        return {
          id: u._id,
          name: u.name || "Unknown",
          Id: u.EmployeeSectionId || `#${u._id.slice(-8).toUpperCase()}`,
          age: u.age || Math.floor(Math.random() * 30) + 25,
          department: u.department || (u.role === "EmployeeSection" ? "IT" : "HR"),
          location: locationStr,
          mobileNumber: u.phone || "9876543256",
          avatar: u.avatar || `https://i.pravatar.cc/150?u=${u._id}`,
        };
      });

      setEmployeeSections(EmployeeSectionsData);
      setFilteredEmployeeSections(EmployeeSectionsData);
      setTotalPages(Math.ceil(EmployeeSectionsData.length / itemsPerPage));
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description: "Failed to load employees",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployeeSections();
  }, [loadEmployeeSections]);

  // Search Filter
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployeeSections(EmployeeSections);
      setTotalPages(Math.ceil(EmployeeSections.length / itemsPerPage));
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = EmployeeSections.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.Id.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.location.toLowerCase().includes(query)
      );
      setFilteredEmployeeSections(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }
    setCurrentPage(1);
  }, [searchQuery, EmployeeSections]);

  // Pagination
  const paginatedEmployeeSections = filteredEmployeeSections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Flex minH="100vh" bg="#F7F9FC" overflow="hidden">
      <Flex flex="1" direction="column" overflow="hidden">
        <Box flex="1" overflowY="auto">
          <Box p={{ base: 4, md: 6, lg: 8 }}>
            {/* Search + Add Button */}
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} mb={6}>
              <Box position="relative" flex="1" maxW="1400px">
                <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)">
                  <Search size={18} color="#6f7986" />
                </Box>
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl="44px"
                  pr="4"
                  py={6}
                  bg="white"
                  color="#162837"
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="lg"
                  fontSize="sm"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px #3182CE",
                  }}
                />
              </Box>

              {/* Add Employee Dialog */}
              <AddEmployeeDialog />
            </Flex>

            {/* Table */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
              {/* Header */}
              <Flex px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                <Box flex="2" fontSize="sm" fontWeight="600" color="gray.600">Name</Box>
                <Box flex="1.5" fontSize="sm" fontWeight="600" color="gray.600">ID</Box>
                <Box flex="1" fontSize="sm" fontWeight="600" color="gray.600">Age</Box>
                <Box flex="1.5" fontSize="sm" fontWeight="600" color="gray.600">Department</Box>
                <Box flex="2" fontSize="sm" fontWeight="600" color="gray.600">Location</Box>
                <Box flex="1.5" fontSize="sm" fontWeight="600" color="gray.600">Mobile</Box>
                <Box flex="1" fontSize="sm" fontWeight="600" color="gray.600" textAlign="right">Actions</Box>
              </Flex>

              {/* Body */}
              {isLoading ? (
                <Box p={6}><EmployeeSectionSkeleton /></Box>
              ) : filteredEmployeeSections.length === 0 ? (
                <Flex justify="center" align="center" py={12}>
                  <Text color="gray.500" fontSize="sm">
                    {searchQuery ? "No employees found" : "No employees available"}
                  </Text>
                </Flex>
              ) : (
                <Box>
                  {paginatedEmployeeSections.map((EmployeeSection, index) => (
                    <Flex
                      key={EmployeeSection.id}
                      px={6}
                      py={4}
                      align="center"
                      borderBottom={index !== paginatedEmployeeSections.length - 1 ? "1px solid" : "none"}
                      borderColor="gray.100"
                      _hover={{ bg: "gray.50" }}
                      transition="all 0.2s"
                    >
                      <Flex flex="2" align="center" gap={3}>
                        <Avatar.Root size="sm">
                          <Avatar.Image src={EmployeeSection.avatar} alt={EmployeeSection.name} />
                          <Avatar.Fallback>
                            {EmployeeSection.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Text fontSize="sm" fontWeight="500" color="gray.900">{EmployeeSection.name}</Text>
                      </Flex>

                      <Box flex="1.5"><Text fontSize="sm" color="gray.700">{EmployeeSection.Id}</Text></Box>
                      <Box flex="1"><Text fontSize="sm" color="gray.700">{EmployeeSection.age} Years</Text></Box>
                      <Box flex="1.5"><Text fontSize="sm" color="gray.700">{EmployeeSection.department}</Text></Box>
                      <Box flex="2"><Text fontSize="sm" color="gray.700">{EmployeeSection.location}</Text></Box>
                      <Box flex="1.5"><Text fontSize="sm" color="gray.700">{EmployeeSection.mobileNumber}</Text></Box>

                      <Flex flex="1" gap={2} justify="flex-end">
                        <IconButton aria-label="View" size="sm" variant="ghost" color="blue.600" _hover={{ bg: "blue.50" }}>
                          <Eye size={18} />
                        </IconButton>
                        <IconButton aria-label="Edit" size="sm" variant="ghost" color="blue.600" _hover={{ bg: "blue.50" }}>
                          <Edit size={18} />
                        </IconButton>
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              )}

              {/* Pagination */}
              {!isLoading && filteredEmployeeSections.length > 0 && (
                <Flex px={6} py={4} justify="space-between" align="center" borderTop="1px solid" borderColor="gray.200">
                  <Text fontSize="sm" color="gray.600">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployeeSections.length)} of {filteredEmployeeSections.length}
                  </Text>
                  <Flex gap={2}>
                    <IconButton aria-label="Previous" size="sm" variant="ghost" onClick={handlePrevPage} disabled={currentPage === 1}>
                      <ChevronLeft size={18} />
                    </IconButton>
                    <IconButton aria-label="Next" size="sm" variant="ghost" onClick={handleNextPage} disabled={currentPage === totalPages}>
                      <ChevronRight size={18} />
                    </IconButton>
                  </Flex>
                </Flex>
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default EmployeeSectionPage;